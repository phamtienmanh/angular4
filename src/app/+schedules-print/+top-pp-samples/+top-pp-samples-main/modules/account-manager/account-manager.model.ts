export enum FieldType {
  HIDE     = 0,
  LABEL    = 1,
  INPUT    = 2,
  NGSELECT = 3
}

export const FormProp = [
  {
    name: 'id',
    label: '',
    isRequired: false,
    type: FieldType.HIDE
  },
  {
    name: 'topPpType',
    label: 'Ship To',
    isRequired: false,
    type: FieldType.LABEL
  },
  {
    name: 'shipToName',
    label: 'Name',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToAddress1',
    label: 'Address 1',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToAddress2',
    label: 'Address 2',
    isRequired: false,
    type: FieldType.INPUT
  },
  {
    name: 'shipToCity',
    label: 'City',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToState',
    label: 'State',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToZip',
    label: 'Zip',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToPhone',
    label: 'Phone',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToPO',
    label: 'PO #',
    isRequired: true,
    type: FieldType.INPUT
  },
  {
    name: 'shipToRef2',
    label: 'Ref 2',
    isRequired: false,
    type: FieldType.INPUT
  },
  {
    name: 'shipToRef3',
    label: 'Ref 3',
    isRequired: false,
    type: FieldType.INPUT
  },
  {
    name: 'shippingCarrierId',
    label: 'Carrier',
    isRequired: true,
    type: FieldType.NGSELECT
  },
  {
    name: 'shipToMethodId',
    label: 'Service',
    isRequired: true,
    type: FieldType.NGSELECT
  },
  {
    name: 'shipToSaturdayDelivery',
    label: 'Saturday Delivery',
    isRequired: true,
    type: FieldType.NGSELECT
  },
  {
    name: 'shipToType',
    label: 'Type',
    isRequired: true,
    type: FieldType.NGSELECT
  },
];

export const FormErrors = FormProp.reduce((result, prop) => {
  result[prop.name] = '';
  return result;
}, {});

export const FormRequires = FormProp.reduce((result, prop) => {
  result[prop.name] = {
    required: prop.isRequired
  };
  return result;
}, {});

export const ValidationMessages = FormProp.reduce((result, prop) => {
  result[prop.name] = {
    required: prop.label + ' is required.'
  };
  return result;
}, {
  status : {
    required: 'Status is required.'
  },
  topPulleds: {
    required: 'Qty Pulled value must be specified.',
    invalidValue: 'Qty Pulled must be less than ' +
    'or equal to Requested for every Size.'
  }
});

export const SaturdayDeliveryData = [
  {
    id: true,
    name: 'Yes'
  },
  {
    id: false,
    name: 'No'
  }
];

export const TypeData = [
  {
    id: 1,
    name: 'Business'
  },
  {
    id: 2,
    name: 'Residential'
  }
];
