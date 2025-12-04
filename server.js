/**
 * SPA를 위한 간단한 개발 서버
 * 모든 경로를 index.html로 리다이렉트하여 클라이언트 사이드 라우팅 지원
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    
    // 루트 경로인 경우 index.html
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // 파일 확장자 추출
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 파일 읽기
    fs.readFile(filePath, (error, content) => {
        if (error) {
            // 파일이 없으면 index.html로 폴백 (SPA 라우팅)
            if (error.code === 'ENOENT') {
                fs.readFile('./index.html', (error, content) => {
                    if (error) {
                        res.writeHead(500);
                        res.end('Server Error: ' + error.code);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('SPA routing is enabled - all routes will fallback to index.html');
});

