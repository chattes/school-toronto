import { isEmpty } from 'lodash';
const ValidLanguages = ['english', 'french'];
export class SchoolLanguage {
  private language: string;
  constructor(language: string) {
    if (isEmpty(language) || !ValidLanguages.includes(language)) {
      this.language = 'english';
    }
    this.language = language;
    return this;
  }
  public get SchoolLanguage(): string {
    return this.language;
  }
}
