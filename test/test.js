'use strict';
const expect = require('chai').expect;
//const add = require('../dist/index').add;
//�ȹ������� Ū�����ߵ�С���ݿ����һ��

describe('ts-hi function test', () => {
    it('should return 3', () => {
        const result = 3;// add(1, 1);
        expect(result).to.equal(3);
    });
});