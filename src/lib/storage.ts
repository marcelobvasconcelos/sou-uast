import fs from 'fs';
import path from 'path';

export interface StorageService {
  saveFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string>;
  deleteFile(fileUrlOrPath: string): Promise<boolean>;
  getFilePath(fileName: string): string;
  fileExists(fileName: string): boolean;
}

export class LocalStorageService implements StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  public getFilePath(fileName: string): string {
    const safeName = path.basename(fileName);
    return path.join(this.uploadDir, safeName);
  }

  public fileExists(fileName: string): boolean {
    const filePath = this.getFilePath(fileName);
    return fs.existsSync(filePath);
  }

  public async saveFile(buffer: Buffer, originalName: string, _mimeType: string): Promise<string> {
    this.ensureUploadDir();
    const safeBaseName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(safeBaseName).toLowerCase();
    const nameWithoutExt = path.basename(safeBaseName, ext);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const finalFileName = `${nameWithoutExt}-${uniqueSuffix}${ext}`;
    const destinationPath = path.join(this.uploadDir, finalFileName);

    await fs.promises.writeFile(destinationPath, buffer);

    // Retorna URL relativa acessível pelo route handler dedicado
    return `/api/uploads/${finalFileName}`;
  }

  public async deleteFile(fileUrlOrPath: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrlOrPath);
      const filePath = this.getFilePath(fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// Singleton de Storage para toda a aplicação
export const storage: StorageService = new LocalStorageService();
