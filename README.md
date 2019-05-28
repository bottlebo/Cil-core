# cil-core

- download this repo 
- install dependencies `npm i`

## Join current testnet
- run `node index.js`

## Test
- run tests `npm test` 

if you want tonns of debug info 
- run `npm run-script testDebugNix` for ***nix**
- run `npm run-script testDebugWin` for **Windows**

# Docker Images Build
- docker build -t tagname:1.1 .
- docker run -p (your port):18222 -d tagname:1.1
- See:
- docker ps -a
