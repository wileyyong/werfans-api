"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegService = void 0;
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const s3_helper_1 = require("../s3.helper");
class FfmpegService {
    init(app) {
        return __awaiter(this, void 0, void 0, function* () {
            app.registerProvider('ffmpegService', this);
        });
    }
    extractCover(videoUrl, userId, outputScreenshotUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileType = 'jpg';
            const downloadRes = yield s3_helper_1.downloadFile(videoUrl);
            const inputFileName = downloadRes.fullPath;
            const outputFileName = `${downloadRes.fileName}.${fileType}`;
            yield new Promise((resolve, reject) => fluent_ffmpeg_1.default(inputFileName)
                .takeScreenshots({
                timestamps: [0],
                folder: downloadRes.dirPath,
                filename: outputFileName,
            })
                .on('end', () => resolve(true))
                .on('error', (err) => reject(err)));
            return s3_helper_1.uploadFile(`${downloadRes.dirPath}/${outputFileName}`, outputScreenshotUrl
                ? { url: outputScreenshotUrl }
                : { key: s3_helper_1.generateKey(fileType, 'avatar', userId) }, fileType);
        });
    }
}
exports.FfmpegService = FfmpegService;
const ffmpegService = new FfmpegService();
exports.default = ffmpegService;
//# sourceMappingURL=ffmpeg.service.js.map