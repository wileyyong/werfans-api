import ffmpeg from 'fluent-ffmpeg';
import { App, IFfmpegService } from '../../domains/app';
import { downloadFile, generateKey, uploadFile } from '../s3.helper';

export class FfmpegService implements IFfmpegService {
  async init(app: App): Promise<void> {
    app.registerProvider('ffmpegService', this);
  }

  async extractCover(videoUrl: string, userId: string, outputScreenshotUrl?: string) {
    const fileType = 'jpg';
    const downloadRes = await downloadFile(videoUrl);
    const inputFileName = downloadRes.fullPath;
    const outputFileName = `${downloadRes.fileName}.${fileType}`;
    await new Promise((resolve, reject) => ffmpeg(inputFileName)
      .takeScreenshots({
        timestamps: [0],
        folder: downloadRes.dirPath,
        filename: outputFileName,
      })
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err)));

    return uploadFile(
      `${downloadRes.dirPath}/${outputFileName}`,
      outputScreenshotUrl
        ? { url: outputScreenshotUrl }
        : { key: generateKey(fileType, 'avatar', userId) },
      fileType,
    );
  }
}

const ffmpegService = new FfmpegService();

export default ffmpegService;
