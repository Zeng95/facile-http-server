import * as path from 'path';
import * as http from 'http';
import * as fs from 'fs/promises';
import { URL } from 'url';
import { IncomingMessage, ServerResponse } from 'http';

const server = http.createServer();
const publicDir = path.join(process.cwd(), 'public');
let cacheAge = 60 * 60 * 24 * 365;

server.on(
  'request',
  async (request: IncomingMessage, response: ServerResponse) => {
    const { url: p, method } = request;
    const fullURL = new URL(p, 'http://localhost:8888/');
    // * url.pathname -> https://example.org/abc/xyz?123 - /abc/xyz
    const pathname = fullURL.pathname;
    let filename = pathname.substr(1);

    if (filename === '') {
      filename = 'index.html';
    }

    if (method !== 'GET') {
      response.statusCode = 200;
      response.end('Response');
      return;
    }

    try {
      const successBuf = await fs.readFile(path.join(publicDir, filename));
      // * Using the toString() method to print the full content of the buffer
      // console.log(buf.toString());

      // * Enabling browser caching
      response.setHeader('Cache-Control', `max-age=${cacheAge}, public`);
      response.end(successBuf);
    } catch (e) {
      // console.log(e)
      if (e.errno === -2) {
        try {
          const errorBuf = await fs.readFile(path.join(publicDir, '404.html'));
          response.writeHead(404);
          response.end(errorBuf);
        } catch (e) {
          console.log(e);
        }
      } else if (e.errno === -21) {
        response.statusCode = 403;
        response.end('Permission denied');
      } else {
        response.statusCode = 500;
        response.end('Internal Server Error');
      }
    }

    // switch (fullURL.pathname) {
    //   case '/index.html':
    //     try {
    //       const buf = await fs.readFile(`${publicDir}/index.html`);
    //       console.log(buf.toString());
    //       response.setHeader('Content-Type', 'text/html; charset=utf-8');
    //       response.end(buf.toString());
    //     } catch (e) {
    //       console.error(e);
    //     }
    //     break;
    //   case '/styles.css':
    //     try {
    //       const buf = await fs.readFile(`${publicDir}/styles.css`);
    //       response.setHeader('Content-Type', 'text/css; charset=utf-8');
    //       response.end(buf.toString());
    //     } catch (e) {
    //       console.error(e);
    //     }
    //     break;
    //   case '/main.js':
    //     try {
    //       const buf = await fs.readFile(`${publicDir}/main.js`);
    //       response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    //       response.end(buf.toString());
    //     } catch (e) {
    //       console.error(e);
    //     }
    //     break;
    //   default:
    //     response.statusCode = 404;
    //     response.end();
    // }

    // const arr = [];

    // * 监听 the chunk of data \ 数据块
    // request.addListener('data', (chunk) => {
    //   arr.push(chunk);
    // });

    // request.addListener('end', () => {
    //   const body = Buffer.concat(arr).toString();
    //   console.log(body);

    //   response.write('1\n');
    //   response.write('2\n');
    //   response.write('3\n');
    //   response.write('4\n');
    //   response.end();
    // });
  }
);

server.listen(8888);
