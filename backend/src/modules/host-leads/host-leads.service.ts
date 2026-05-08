import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateHostLeadDto } from './dto/create-host-lead.dto';

@Injectable()
export class HostLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateHostLeadDto) {
    const detailedMessage = this.buildLeadMessage(dto);

    const lead = await this.prisma.hostLead.create({
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.trim().toLowerCase(),
        phone: dto.phone?.trim() || undefined,
        propertyCity: dto.propertyCity.trim(),
        propertyCountry: dto.propertyCountry.trim(),
        propertyType: dto.propertyType.trim(),
        message: detailedMessage,
      },
    });

    await this.notificationsService.sendAdminAlert({
      subject: 'New host lead',
      message: `
New host interest request submitted.

Owner:
${dto.firstName} ${dto.lastName}
Email: ${dto.email}
Phone: ${dto.phone || 'Not provided'}
Preferred contact: ${dto.preferredContactMethod || 'Not provided'}

Property:
Name: ${dto.propertyName || 'Not provided'}
Type: ${dto.propertyType}
Location: ${dto.propertyCity}, ${dto.propertyRegion || 'No region'}, ${dto.propertyCountry}
Address: ${dto.propertyAddress || 'Not provided'}

Details:
Bedrooms: ${dto.bedrooms || 'Not provided'}
Bathrooms: ${dto.bathrooms || 'Not provided'}
Max guests: ${dto.maxGuests || 'Not provided'}
Estimated nightly rate: ${dto.estimatedNightlyRate || 'Not provided'}
Availability status: ${dto.availabilityStatus || 'Not provided'}
Current listing URL: ${dto.currentListingUrl || 'Not provided'}

Message:
${dto.message || 'No message provided.'}
      `.trim(),
    });

    return {
      success: true,
      leadId: lead.id,
    };
  }

  async list() {
    return this.prisma.hostLead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private buildLeadMessage(dto: CreateHostLeadDto) {
    return `
Property lead details

Owner:
${dto.firstName} ${dto.lastName}
Email: ${dto.email}
Phone: ${dto.phone || 'Not provided'}
Preferred contact: ${dto.preferredContactMethod || 'Not provided'}

Property:
Name: ${dto.propertyName || 'Not provided'}
Type: ${dto.propertyType}
Country: ${dto.propertyCountry}
Region: ${dto.propertyRegion || 'Not provided'}
City: ${dto.propertyCity}
Address: ${dto.propertyAddress || 'Not provided'}

Capacity:
Bedrooms: ${dto.bedrooms || 'Not provided'}
Bathrooms: ${dto.bathrooms || 'Not provided'}
Max guests: ${dto.maxGuests || 'Not provided'}

Commercial:
Estimated nightly rate: ${dto.estimatedNightlyRate || 'Not provided'}
Availability status: ${dto.availabilityStatus || 'Not provided'}
Current listing URL: ${dto.currentListingUrl || 'Not provided'}

Message:
${dto.message || 'No message provided.'}
    `.trim();
  }
}