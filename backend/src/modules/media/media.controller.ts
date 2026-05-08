import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { CreateUploadUrlDto } from './dto/create-upload-url.dto';
import { FinalizeUploadDto } from './dto/finalize-upload.dto';
import { ReorderPropertyImagesDto } from './dto/reorder-property-images.dto';
import { UpdateImageMetaDto } from './dto/update-image-meta.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('HOST')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload-url')
  createUploadUrl(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateUploadUrlDto,
  ) {
    return this.mediaService.createUploadUrl(user.sub, dto);
  }

  @Post('finalize')
  finalizeUpload(
    @CurrentUser() user: { sub: string },
    @Body() dto: FinalizeUploadDto,
  ) {
    return this.mediaService.finalizeUpload(user.sub, dto);
  }

  @Patch('reorder')
  reorder(
    @CurrentUser() user: { sub: string },
    @Body() dto: ReorderPropertyImagesDto,
  ) {
    return this.mediaService.reorder(user.sub, dto);
  }

  @Patch(':imageId')
  updateMeta(
    @CurrentUser() user: { sub: string },
    @Param('imageId') imageId: string,
    @Body() dto: UpdateImageMetaDto,
  ) {
    return this.mediaService.updateMeta(user.sub, imageId, dto);
  }

  @Delete(':imageId')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('imageId') imageId: string,
  ) {
    return this.mediaService.remove(user.sub, imageId);
  }
}