import { PinataSDK } from "pinata";

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const PINATA_GATEWAY_URL = process.env.REACT_APP_PINATA_GATEWAY_URL;

const pinata = new PinataSDK({
  pinataJwt: PINATA_JWT,
  pinataGateway: PINATA_GATEWAY_URL,
});

export const uploadFiles = async (fileArray) => {
  const cidArray = [];

  for (let file of fileArray) {
    const upload = await pinata.upload.file(file);
    cidArray.push(upload.cid);
  }

  return cidArray;
};

export const uploadJson = async (jsonData, fileName) => {
  const upload = await pinata.upload.json(jsonData).addMetadata({
    name: fileName + ".json",
  });
  return upload.cid;
};

export const retrieveFile = async (cid) => {
  const res = await pinata.gateways.get(cid);
  return res;
};

export const createSignedURL = async (cid) => {
  const res = await pinata.gateways.createSignedURL({
    cid: cid,
    expires: 3600, // Number of seconds link is valid for
  });
  return res;
};
