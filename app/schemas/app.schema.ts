import { StrikeTypeValues } from '../domains/strike';

const TYPES = ['avatar'];
const MULTIPART_TYPES = ['video'];

const schemas = {
  banContentSchema: {
    properties: {
      banningReasonType: {
        type: 'string',
        enum: StrikeTypeValues,
      },
      banningReasonDescription: {
        type: 'string',
      },
    },
    required: ['banningReasonType'],
    additionalProperties: false,
  },
  banUserSchema: {
    properties: {
      banningReasonDescription: {
        type: 'string',
      },
    },
    additionalProperties: false,
  },
  getUploadUrlSchema: {
    properties: {
      type: {
        type: 'string',
        enum: TYPES,
      },
      fileType: {
        type: 'string',
        minLength: 1,
      },
    },
    required: ['type', 'fileType'],
    additionalProperties: false,
  },
  multipartStartSchema: {
    properties: {
      type: {
        type: 'string',
        enum: MULTIPART_TYPES,
      },
      fileType: {
        type: 'string',
        minLength: 1,
      },
    },
    required: ['type', 'fileType'],
    additionalProperties: false,
  },
  multipartGetUrlSchema: {
    properties: {
      key: {
        type: 'string',
        minLength: 1,
      },
      uploadId: {
        type: 'string',
        minLength: 1,
      },
      partNumber: {
        type: 'integer',
        minimum: 1,
      },
    },
    required: ['key', 'uploadId', 'partNumber'],
    additionalProperties: false,
  },
  multipartCompleteSchema: {
    properties: {
      key: {
        type: 'string',
        minLength: 1,
      },
      uploadId: {
        type: 'string',
        minLength: 1,
      },
      parts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            ETag: {
              type: 'string',
            },
            PartNumber: {
              type: 'integer',
              minimum: 1,
            },
          },
          required: ['ETag', 'PartNumber'],
        },
      },
    },
    required: ['key', 'uploadId', 'parts'],
    additionalProperties: false,
  },
  sendTipBodySchema: {
    properties: {
      sum: {
        minimum: 1,
        maximum: 1000,
        type: 'number',
      },
    },
    additionalProperties: false,
    required: ['sum'],
  },
};

export type Schemas = typeof schemas;

export default schemas;
