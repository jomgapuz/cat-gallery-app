export type APIBreed = {
  id: string;
  name: string;
  origin: string;
  temperament: string;
  description: string;
};

export type APICatImageMeta = {
  id: string;
  url: string;
  breeds?: APIBreed[];
  width: number;
  height: number;
};
