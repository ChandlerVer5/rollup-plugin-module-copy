
import { resolve } from "path"
// import { clean as cleanModules } from 'clean-modules';
import * as fs from "fs-extra"

interface Options {
  /**array of some packages(you want to copy) names */
  packages: string[]
  /**source folder containing the main node_modules folder */
  src?: string
  /**destination folder to generate the destiation node_modules folder */
  dest?: string
  /**option to make a symlink to src `node_modules` folders instead of copying (best for dev) */
  symlink?: boolean
  /**clean modules */
  clean?: boolean
}

// https://github.com/justintaylor-dev/rollup-plugin-node-copy/blob/master/index.js

const hasPnpm = (currentDir: string) => fs.existsSync(resolve(currentDir, "node_modules", ".pnpm"));

const unique = (array: Options["packages"]) => {
  return array.filter((v, i, a) => a.indexOf(v) === i);
};

const nodeSolve = ({ src, pkg, keepDevDependencies }: {
  src: string
  pkg: string
  keepDevDependencies: boolean
}) => {
  let allDependencies = [pkg];
  const fullPath = resolve(src, "node_modules", pkg);
  // console.log(`getting pkgs for ${fullPath}`);
  const pkgJson = resolve(fullPath, "package.json");
  if (fs.existsSync(pkgJson)) {
    const raw = fs.readFileSync(pkgJson, { encoding: "utf-8" });
    const json = JSON.parse(raw);
    let { dependencies, devDependencies } = json;
    const depList = dependencies ? Object.keys(dependencies) : [];
    const devDepList = devDependencies ? Object.keys(devDependencies) : [];
    const resDepList = keepDevDependencies
      ? depList.concat(devDepList)
      : depList;
    if (resDepList.length > 0) {
      allDependencies = allDependencies.concat(resDepList);
      resDepList.map((name) => {
        allDependencies = allDependencies.concat(
          nodeSolve({ src, pkg: name, keepDevDependencies })
        );
      });
    }
  }
  return allDependencies || [];
};

export async function copyModules({ packages, src, dest, symlink }: Options) {
  const allPkg = packages.flatMap((pkg) =>
    nodeSolve({ src, pkg, keepDevDependencies: false })
  );
  const uniqePkg = unique(allPkg);
  console.log(
    `Copying ${packages.length} Node Module(s) (${packages}),total ${uniqePkg.length} Dependencies`
  );
  fs.ensureDirSync(resolve(dest, "node_modules"));
  uniqePkg.map((pkg) => {
    let fullSrcPath = ""
    if (packages.includes(pkg)) {
      fullSrcPath = resolve(src, "node_modules", pkg);
    } else {
      fullSrcPath = resolve(src, "node_modules", hasPnpm(src) ? ".pnpm" : "", hasPnpm(src) ? "node_modules" : "", pkg);
    }
    const fullDstPath = resolve(dest, "node_modules", pkg);
    fs.ensureDirSync(fullDstPath);
    if (!symlink) {
      fs.copySync(fs.realpathSync(fullSrcPath), fullDstPath);
    } else {
      fs.ensureSymlink(fullSrcPath, fullDstPath, "dir");
    }
  });
  // TODO
}

export default function rollupNodeCopyPlugin({ packages, src, dest, clean = true, symlink = false }: Options) {
  return {
    name: "copy-node-modules-enhance",
    renderStart: async (options: any) => {
      src = src || process.cwd()
      dest = dest || options.dir

      const allPkg = packages.flatMap((pkg) =>
        nodeSolve({ src, pkg, keepDevDependencies: false })
      );
      const uniqePkg = unique(allPkg);
      console.log(
        `Copying ${packages.length} Node Module(s) (${packages}),total ${uniqePkg.length} Dependencies`
      );
      const dest_module_path = resolve(dest, "node_modules")
      fs.ensureDirSync(dest_module_path);
      uniqePkg.map((pkg) => {
        let fullSrcPath = ""
        if (packages.includes(pkg)) {
          fullSrcPath = resolve(src, "node_modules", pkg);
        } else {
          fullSrcPath = resolve(src, "node_modules", hasPnpm(src) ? ".pnpm" : "", hasPnpm(src) ? "node_modules" : "", pkg);
        }
        const full_module_path = resolve(dest_module_path, pkg);
        fs.ensureDirSync(full_module_path);
        if (!symlink) {
          fs.copySync(fs.realpathSync(fullSrcPath), full_module_path);
        } else {
          fs.ensureSymlink(fullSrcPath, full_module_path, "dir");
        }
      });
      // TODO
      /*clean && cleanModules({
        directory: dest_module_path,
        keepEmpty: false
      })
      */
    },
  };
};
