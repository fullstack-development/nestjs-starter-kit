import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseParamIntPipe implements PipeTransform<string> {
    async transform(value: string) {
        const val = parseInt(value, 10);
        if (isNaN(val)) {
            throw new BadRequestException(`ParseParamIntPipe validation failed. Actual: ${value}`);
        }
        return val;
    }
}
