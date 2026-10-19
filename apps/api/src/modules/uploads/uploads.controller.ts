import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import * as path from 'path';
import { UploadsService } from './uploads.service';

@Controller('api/v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = path.extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
      },
    }),
  )
  uploadFile(@UploadedFile() file?: any) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: file.originalname,
      filename: file.filename,
      size: file.size,
      type: file.mimetype,
      url: `http://localhost:3000/api/v1/uploads/${file.filename}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Current User',
    };
  }

  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.uploadsService.getFilePath(filename);
    return res.sendFile(filePath);
  }

  @Get()
  listFiles() {
    return this.uploadsService.listFiles();
  }

  @Delete(':filename')
  deleteFile(@Param('filename') filename: string) {
    return this.uploadsService.deleteFile(filename);
  }
}
