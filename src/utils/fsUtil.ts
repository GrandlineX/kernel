import fs from 'fs';
import * as Path from 'path';
import { CoreConfig } from './config';
import { createCerts } from '../modules';

export function createFolderIfNotExist(path: string): boolean {
  if (!fs.existsSync(path)) {
    try {
      fs.mkdirSync(path);
      return true;
    } catch (e) {
      console.error(`Cant create folder at ${path}`);
      return false;
    }
  } else {
    return true;
  }
}

export function removeFolderIfNotExist(path: string): boolean {
  if (fs.existsSync(path)) {
    try {
      fs.rmdirSync(path, {
        recursive: true,
      });
      return true;
    } catch (e) {
      console.error(`Cant remoce folder at ${path}`);
      return false;
    }
  } else {
    return true;
  }
}

export function createCertsIfNotExist(config: CoreConfig): void {
  const path = config.dir.certs;
  if (!fs.existsSync(path)) {
    createFolderIfNotExist(path);
  }

  const cert = fs.existsSync(Path.join(path, 'cert.pem'));
  const key = fs.existsSync(Path.join(path, 'key.pem'));
  if (cert && key) {
    return;
  }
  if (cert) {
    fs.rmSync(Path.join(path, 'cert.pem'));
  }

  if (key) {
    fs.rmSync(Path.join(path, 'key.pem'));
  }
  createCerts(path);
}
