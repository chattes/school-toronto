import { isEmpty } from 'lodash';
const ValidLevels = ['elementary', 'intermediate'];
export class SchoolLevel {
  private level: string;
  constructor(level: string) {
    if (isEmpty(level) || !ValidLevels.includes(level)) {
      this.level = 'english';
    }
    this.level = level;
    return this;
  }
  public get SchoolLevel(): string {
    return this.level;
  }
}
