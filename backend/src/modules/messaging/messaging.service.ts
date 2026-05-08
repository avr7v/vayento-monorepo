import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConversationType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async listMine(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingStatus: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            senderUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        senderUserId: {
          not: userId,
        },
        readAt: null,
        conversation: {
          participants: {
            some: {
              userId,
            },
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    const unreadByConversation = new Map(
      unreadCounts.map((item) => [item.conversationId, item._count._all]),
    );

    return conversations.map((conversation) => ({
      ...conversation,
      unreadCount: unreadByConversation.get(conversation.id) ?? 0,
    }));
  }

  async listMessages(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);
    await this.markAsRead(userId, conversationId);

    return this.prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async createConversation(userId: string, dto: CreateConversationDto) {
    let recipientUserId = dto.recipientUserId;

    if (!recipientUserId && dto.propertyId) {
      const property = await this.prisma.property.findUnique({
        where: {
          id: dto.propertyId,
        },
      });

      recipientUserId = property?.hostId;
    }

    if (dto.bookingId) {
      const booking = await this.prisma.booking.findUnique({
        where: {
          id: dto.bookingId,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found.');
      }

      const allowed = [booking.guestUserId, booking.hostId].includes(userId);

      if (!allowed) {
        throw new ForbiddenException(
          'You cannot open a conversation for this booking.',
        );
      }

      recipientUserId =
        userId === booking.guestUserId ? booking.hostId : booking.guestUserId;
    }

    if (!recipientUserId) {
      const admin = await this.prisma.user.findFirst({
        where: {
          role: UserRole.ADMIN,
          isActive: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      recipientUserId = admin?.id;
    }

    if (!recipientUserId) {
      throw new NotFoundException(
        'No conversation recipient could be determined.',
      );
    }

    const participants =
      recipientUserId === userId
        ? [{ userId }]
        : [{ userId }, { userId: recipientUserId }];

    const conversation = await this.prisma.conversation.create({
      data: {
        propertyId: dto.propertyId,
        bookingId: dto.bookingId,
        type:
          dto.type ??
          (dto.bookingId
            ? ConversationType.BOOKING
            : dto.propertyId
              ? ConversationType.INQUIRY
              : ConversationType.SUPPORT),
        participants: {
          create: participants,
        },
        messages: {
          create: {
            senderUserId: userId,
            body: dto.message,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          include: {
            senderUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    await this.notifyParticipants(userId, conversation.id, dto.message);

    return conversation;
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ) {
    await this.ensureParticipant(userId, conversationId);

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderUserId: userId,
        body: dto.body,
      },
      include: {
        senderUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    await this.prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    await this.notifyParticipants(userId, conversationId, dto.body);

    return message;
  }

  async markAsRead(userId: string, conversationId: string) {
    await this.ensureParticipant(userId, conversationId);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        type: true,
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    if (
      user?.role === UserRole.ADMIN &&
      conversation.type === ConversationType.SUPPORT
    ) {
      await this.prisma.message.updateMany({
        where: {
          conversationId,
          readAt: null,
          senderUser: {
            role: {
              not: UserRole.ADMIN,
            },
          },
        },
        data: {
          readAt: new Date(),
        },
      });

      return {
        success: true,
      };
    }

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderUserId: {
          not: userId,
        },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }

  async adminSupportInbox() {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.SUPPORT,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            senderUser: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        supportTickets: true,
      },
    });

    const unreadCounts = await this.prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        readAt: null,
        conversation: {
          type: ConversationType.SUPPORT,
        },
        senderUser: {
          role: {
            not: UserRole.ADMIN,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    const unreadByConversation = new Map(
      unreadCounts.map((item) => [item.conversationId, item._count._all]),
    );

    return conversations.map((conversation) => ({
      ...conversation,
      unreadCount: unreadByConversation.get(conversation.id) ?? 0,
    }));
  }

  private async ensureParticipant(userId: string, conversationId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        type: true,
        participants: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    if (conversation.participants.length > 0) {
      return;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (
      user?.role === UserRole.ADMIN &&
      conversation.type === ConversationType.SUPPORT
    ) {
      return;
    }

    throw new ForbiddenException('You do not have access to this conversation.');
  }

  private async notifyParticipants(
    senderUserId: string,
    conversationId: string,
    body: string,
  ) {
    const sender = await this.prisma.user.findUnique({
      where: {
        id: senderUserId,
      },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const participants = await this.prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: {
          not: senderUserId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    await Promise.all(
      participants.map((participant) =>
        this.notificationsService
          .sendMessageAlert({
            to: participant.user.email,
            userId: participant.user.id,
            senderName: `${sender?.firstName ?? 'Vayento'} ${
              sender?.lastName ?? ''
            }`.trim(),
            preview: body.slice(0, 160),
            conversationId,
          })
          .catch(() => undefined),
      ),
    );
  }
}