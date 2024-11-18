export interface MulterFile {
  fieldname: string;
  originalname: string;
  buffer: Buffer;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export type CustomFiles = {
  overview_img_url?: MulterFile[];
  images?: MulterFile[];
};
