# Rollup Plugin Module Copy

For problem Node.js modules that won't bundle with Rollup, a brute force copy method is required.
Instead of manually entering all the dependenices needed, simply input each of the trouble modules
you need, and that module with it's dependencies will be copied into your target node_modules directory.

## Usage

`yarn add @ver5/rollup-plugin-module-copy -D`

```
import moduleCopy from '@ver5/rollup-plugin-module-copy';

[...]

plugins: [
    moduleCopy({
        packages: ['jimp'],
    }),
]
```

## Parameters

- **packages** - ({array[string]})
  - array of some packages(you want to copy) names
- **src** - ({string}, default:current rollup running directory)
  - source folder containing the main `node_modules` folder
- **dest** - ({string}, default: output dir)
  - destination folder to generate the destiation `node_modules` folder
- **clean** - (**TODO**{boolean}, default:`true`)
  - Clear the corresponding modules directory
- **symlink** - ({boolean}, default:`false`)
    - option to make a symlink to src `node_modules` folders instead of copying (best for dev)

## credit
https://github.com/justintaylor-dev/rollup-plugin-node-copy
