import * as fs from 'fs-promise';

const config = {
  libName: 'ngx-dom-component'
};


console.info = (...args:any[]) => {
  args.forEach((arg: any) => {
    console.log('\x1b[96m', arg,'\x1b[0m');
  });
};

console.warn = (...args:any[]) => {
  args.forEach((arg: any) => {
    console.log('\x1b[93m', arg,'\x1b[0m');
  });
};

console.error = (...args:any[]) => {
  args.forEach((arg: any) => {
    console.log('\x1b[91m', arg,'\x1b[0m');
  });
};


export class Shell {
  static isWin: boolean = /^win/.test(process.platform);
  static childProcess: any = require('child_process');

  constructor() {}

  execute(commandName: string, args: string[] = []): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      Shell.childProcess.exec(
        commandName + ' ' + args.join(' '),
        { encoding: 'buffer' },
        (error: Error, stdout: Buffer, stderr: Buffer) => {
          const _stdout = stdout.toString('utf8').trim();
          const _stderr = stderr.toString('utf8').trim();
          if(_stderr) {
            reject(_stderr);
          } else {
            resolve(_stdout);
          }
        }
      );
    });
  }
}

const shell = new Shell();


export class Task {
  static tasks: { [key: string]: Task } = {};

  static register(taskName: string, callback: any): any {
    Task.tasks[taskName] = new Task(taskName, callback);
    return Task;
  }

  static execute(taskNames: string[]): Promise<any> {
    let promise: Promise<any> = Promise.resolve();
    for(let taskName of taskNames) {
      promise = promise.then(() => {
        return Task.tasks[taskName] ? Task.tasks[taskName].execute() : Promise.reject(new Error('Invalid task name'));
      });
    }
    return promise;
  }

  constructor(
    public taskName: string,
    public callback: any
  ) {}

  execute(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      resolve(Promise.resolve(this.callback()).then(() => {
        console.info('Task ' + this.taskName + ' DONE');
      }).catch((error: any) => {
        throw new Error('Task ' + this.taskName + ' FAILED\n' + error.toString());
      }));
    });
  }
}

Task
  .register('rimraf', () => {
    return shell.execute('rimraf', ['dist']);
  })
  .register('compile-esm', () => {
    return shell.execute('tsc', ['-p', 'tsconfig-esm.json']);
  })
  .register('rollup', () => {
    return shell.execute('rollup', ['-c', 'rollup.config.js', 'dist/' + config.libName + '.js', '>', 'dist/' + config.libName + '.bundle.js'])
      .catch((error: any) => { // because rollup output in stderr...
        console.error(error);
      });
  })
  .register('copy-package', () => {
    const destination = './dist/package.json';
    return fs.copy('package.json', destination)
      .then(() => {
        const packageJson = JSON.parse((<any>fs).readFileSync(destination).toString());
        delete packageJson.devDependencies;
        delete packageJson.scripts;
        (<any>fs).writeFileSync(destination, JSON.stringify(packageJson, null, 2));
      });
  })
  .register('compile-angular', () => {
    return shell.execute('ngc');
  })
  .register('copy-npm-files', () => {
    return Promise.all([
      fs.copy('README.md', './dist/README.md')
    ]);
  })

  .execute([
    'rimraf',
    'compile-esm',
    'rollup',
    'copy-package',
    'compile-angular',
    'copy-npm-files',
  ])

  .catch((error: Error) => {
    console.error(error.message);
  })
;


