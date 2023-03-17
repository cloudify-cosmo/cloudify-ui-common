import {
    createConcatCall,
    createGetAttributeCall,
    createGetInputCall,
    createGetSecretCall,
    createGetSysCall
} from '../src/blueprint';

describe('blueprint building utils', () => {
    it('should create get_secret call', () => {
        const secretKey = 'key';
        expect(createGetSecretCall(secretKey)).toEqual({ get_secret: secretKey });
    });
    it('should create get_input call', () => {
        const input = 'input';
        expect(createGetInputCall(input)).toEqual({ get_input: input });
    });
    it('should create get_attritue call', () => {
        const arg = 'arg';
        expect(createGetAttributeCall(arg)).toEqual({ get_attribute: [arg] });
    });
    it('should create get_sys call', () => {
        const arg = 'arg';
        expect(createGetSysCall(arg)).toEqual({ get_sys: [arg] });
    });
    it('should create concat call', () => {
        const arg = 'arg';
        expect(createConcatCall(arg)).toEqual({ concat: [arg] });
    });
});
