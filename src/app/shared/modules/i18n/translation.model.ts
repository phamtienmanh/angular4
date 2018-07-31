export class TranslationModel {
  public code: string;
  public name: string;
  public iconUrl?: string;
  constructor(code: string, name: string) {
    this.code = code;
    this.name = name;
    this.iconUrl = `/assets/img/flags/${this.code}.png`;
  }
}
