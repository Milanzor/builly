[![travis-build][travis-build]][travis-build-url]
[![david-dm-status][david-dm-status]][david-dm-status-url]
[![license][license]][license-url]
[![downloads-week][downloads-week]][downloads-week-url]

# Builbo
Webinterface for your builders/bundlers (e.g. Webpack, Parcel, Rollup, Gulp, etc.).

## What
Builbo starts a webinterface on port 3000 (default) and allows you to start and stop any `yarn` or `npm` command on any directory on your machine.

## Demo
![Demo gif](https://github.com/Milanzor/builbo/blob/master/docs/img/demo.gif?raw=true)


## How to use
- Clone this repo
- Install dependencies (`yarn` || `npm`)
- Copy example.builders.json to builders.json and edit to your liking, read below for options
- Run `yarn start` or `npm run start`
- Go to `yourip:3000` and see the result


## Caution
Builbo spawns child processes on your machine with commands you provide in your builders.json file. If your builders `yarn` or `npm` command is `rm -rf *`, thy will be done.

[travis-build]: https://api.travis-ci.org/Milanzor/builbo.svg?branch=master
[travis-build-url]: https://travis-ci.org/Milanzor/builbo

[david-dm-status]: https://david-dm.org/milanzor/builbo.svg
[david-dm-status-url]: https://david-dm.org/milanzor/builbo

[license]: https://img.shields.io/github/license/Milanzor/builbo.svg
[license-url]: https://github.com/Milanzor/builbo/blob/master/LICENSE

[downloads-week]: https://img.shields.io/npm/dw/builbo.svg
[downloads-week-url]: https://www.npmjs.com/package/builbo
