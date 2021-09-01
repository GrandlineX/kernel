import os from 'os';
import path from 'path';

export enum OsRelease {
  'FREEBSD',
  'OPENBSD',
  'SUNOS',
  'AIX',
  'WIN32',
  'LINUX',
  'DARWIN',
}

export interface BaseCoreConfig {
  dir: {
    root: string;
    data: string;
    db: string;
    certs: string;
    temp: string;
  };
  icon: string;
  os: OsRelease;
  arch: string;
}

export interface CoreConfig extends BaseCoreConfig {
  net: {
    port: number;
    domain: string;
  };
}
export function getConfig(
  appName: string,
  pathOverride?: string
): BaseCoreConfig {
  let dir: string;
  let icon: string;
  let base;
  if (pathOverride !== undefined) {
    base = pathOverride;
  } else {
    base = os.homedir();
  }
  let ose: OsRelease;
  const arch = os.arch();
  switch (os.platform()) {
    case 'darwin':
      dir = path.join(base, 'Library', appName);
      ose = OsRelease.DARWIN;
      icon = 'favicon.icns';
      break;
    case 'linux':
      dir = path.join(base, appName);
      ose = OsRelease.LINUX;
      icon = 'favicon.png';
      break;
    case 'win32':
      icon = 'favicon.ico';
      dir = path.join(base, appName);
      ose = OsRelease.WIN32;
      break;
    default:
      console.error('Unssuportet System Type');
      process.exit(1);
  }

  return {
    dir: {
      root: dir,
      data: path.join(dir, 'data'),
      db: path.join(dir, 'db'),
      certs: path.join(dir, 'data', 'certs'),
      temp: path.join(dir, 'temp'),
    },
    icon,
    os: ose,
    arch,
  };
}
