import chalk from 'chalk';

class Progress {
  constructor() {
    this.total = 0;
    this.current = 0;
    // eslint-disable-next-line
    this.barLength = process.stdout.columns - 30;
  }

  init(total) {
    this.total = total;
    this.current = 0;
    this.update(this.current);
  }

  finish() {
    process.stdout.write('\r');
    process.stdout.clearLine();
  }

  update(current) {
    this.current = current;
    const currentProgress = this.current / this.total;
    this.draw(currentProgress);
  }

  draw(currentProgress) {
    const filledBarLength = (currentProgress * this.barLength)
      .toFixed(0);

    const emptyBarLength = this.barLength - filledBarLength;

    const filledBar = this.getBar(filledBarLength, ' ', chalk.bgCyan);
    const emptyBar = this.getBar(emptyBarLength, '-');
    // eslint-disable-next-line
    const percentageProgress = (currentProgress * 100).toFixed(2);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(chalk.green(
      `Starting applify: [${filledBar}${emptyBar}] | ${percentageProgress}%`
    ));
  }

  getBar(length, char, color=(a)=> a) {
    let str = '';
    for (let i = 0; i < length; i += 1) {
      str += char;
    }
    return color(str);
  }
}

export const progress = new Progress();
