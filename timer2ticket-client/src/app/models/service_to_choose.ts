export class ServiceToChoose {
  key: string;
  name: string;
  isChosen: boolean;

  constructor(name: string) {
    // remove all white spaces
    this.key = name.replace(/\s+/g, '');
    this.name = name;
    this.isChosen = false;
  }
}