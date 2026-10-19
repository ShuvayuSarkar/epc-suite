import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(filename: string): string {
    const safeFilename = path.basename(filename);
    const fullPath = path.join(this.uploadDir, safeFilename);
    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException(`File ${filename} not found`);
    }
    return fullPath;
  }

  deleteFile(filename: string): { success: boolean } {
    const fullPath = this.getFilePath(filename);
    try {
      fs.unlinkSync(fullPath);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  listFiles(): string[] {
    if (!fs.existsSync(this.uploadDir)) return [];
    return fs.readdirSync(this.uploadDir);
  }
}
