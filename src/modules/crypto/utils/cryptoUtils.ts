import crypto from 'crypto';
import { pki } from 'node-forge';
import fs from 'fs';
import Path from 'path';

export function generateSeed(): string {
  return `${crypto.randomBytes(4).readUInt32BE()}`;
}
export function createCerts(path: string): void {
  // generate a keypair or use one you have already
  const keys = pki.rsa.generateKeyPair(2048);

  // create a new certificate
  const cert = pki.createCertificate();

  // fill the required fields
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  // use your own attributes here, or supply a csr (check the docs)
  const attrs = [
    {
      name: 'commonName',
      value: 'localhost',
    },
    {
      name: 'countryName',
      value: 'DE',
    },
    {
      shortName: 'ST',
      value: 'NRW',
    },
    {
      name: 'localityName',
      value: 'ESSEN',
    },
    {
      name: 'organizationName',
      value: 'GrandLineX',
    },
    {
      shortName: 'OU',
      value: 'GLX',
    },
  ];

  // here we set subject and issuer as the same one
  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // the actual certificate signing
  cert.sign(keys.privateKey);

  // now convert the Forge certificate to PEM format
  const pem = pki.certificateToPem(cert);
  const privKey = pki.privateKeyToPem(keys.privateKey);
  fs.writeFileSync(Path.join(path, 'cert.pem'), pem, {
    mode: 0o755,
  });
  fs.writeFileSync(Path.join(path, 'key.pem'), privKey, {
    mode: 0o755,
  });
}
