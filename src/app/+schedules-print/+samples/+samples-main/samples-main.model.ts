export enum StatusType {
  ArtRipped        = 0,
  ScreenMade       = 1,
  Approved         = 2,
  PellonMade       = 3,
  ApprovedToSample = 4,
  InkReady         = 5,
  NeckLabelReady   = 6
}

export const StatusTypeList = [
  {
    prop: 'artRipped',
    status: 'isArtRipped',
    name: 'Art Ripped'
  },
  {
    prop: 'screenMade',
    status: 'isScreenMade',
    name: 'Screen Made'
  },
  {
    prop: 'approved',
    status: 'isApproved',
    name: 'Approved'
  },
  {
    prop: 'pellonMade',
    status: 'isPellonMade',
    name: 'Pellon Made'
  },
  {
    prop: 'approvedToSample',
    status: 'isApprovedToSample',
    name: 'Approved To Sample'
  },
  {
    prop: 'inkReady',
    status: 'isInkReady',
    name: 'Ink Ready'
  },
  {
    prop: 'neckLabelReady',
    status: 'isNeckLabelReady',
    name: 'Neck Label Ready'
  }
];
