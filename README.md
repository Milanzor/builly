[![travis-build][travis-build]][travis-build-url]
[![david-dm-status][david-dm-status]][david-dm-status-url]
[![license][license]][license-url]

# Builly
Webinterface for your builders/bundlers (e.g. Webpack, Parcel, Rollup, Gulp, etc.).

## What
Builly starts a webinterface on port 3000 (default) and allows you to start and stop any `yarn` or `npm` command on any directory on your machine.

## Demo
![Demo gif](https://github.com/Milanzor/builly/blob/master/docs/img/demo.gif?raw=true)


## How to use
- Clone this repo
- Install dependencies (`yarn` || `npm`)
- Copy example.builders.json to builders.json and edit to your liking, read below for options
- Run `yarn start` or `npm run start`
- Go to `yourip:3000` and see the result


## Caution
Builly spawns child processes on your machine with commands you provide in your builders.json file. If your builders `yarn` or `npm` command is `rm -rf *` or anything malicious, thy will be done.

[travis-build]: https://api.travis-ci.org/Milanzor/builly.svg?branch=master
[travis-build-url]: https://travis-ci.org/Milanzor/builly

[david-dm-status]: https://david-dm.org/milanzor/builly.svg
[david-dm-status-url]: https://david-dm.org/milanzor/builly

[license]: https://img.shields.io/github/license/Milanzor/builly.svg
[license-url]: https://github.com/Milanzor/builly/blob/master/LICENSE
