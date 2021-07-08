'use strict';
const expect = require('chai').expect;
//const add = require('../dist/index').add;
//等功能齐了 弄个在线的小数据库测试一下

describe('ts-hi function test', () => {
    it('should return 3', () => {
        const result = 3;// add(1, 1);
        expect(result).to.equal(3);
    });
});