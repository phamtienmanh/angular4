export enum ProductPackagingType {
  SewInLabel = 1,
  PrintedNeckLabel = 2,
  LicensorHangTag = 3,
  Packaging = 4,
  LicensorSticker = 5,
  CareSticker = 6
}

export const PackagingType = [
  {
    id: ProductPackagingType.SewInLabel,
    name: 'Sew In Label'
  },
  {
    id: ProductPackagingType.PrintedNeckLabel,
    name: 'Printed Neck Label'
  },
  {
    id: ProductPackagingType.LicensorHangTag,
    name: 'Licensor Hang Tag'
  },
  {
    id: ProductPackagingType.Packaging,
    name: 'Packaging'
  },
  {
    id: ProductPackagingType.LicensorSticker,
    name: 'Licensor Sticker'
  },
  {
    id: ProductPackagingType.CareSticker,
    name: 'Care Sticker'
  }
];
