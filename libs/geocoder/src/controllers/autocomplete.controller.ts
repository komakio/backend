import { Controller, HttpCode, Post, Body } from '@nestjs/common';
import {
  ApiResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '@utils/decorators';
import {
  AutocompleteParams,
  GeocoderService,
  AutocompleteResult,
} from '../geocoder.service';

class AutocompleteResults {
  @ApiProperty({ type: AutocompleteResult, isArray: true })
  public results: AutocompleteResult[];
}

@ApiTags('geocoder')
@Controller('v1/geocoder/autocomplete')
export class AutocompleteController {
  constructor(private geocoder: GeocoderService) {}

  @Post()
  @ApiOperation({
    description: 'Autocomplete results',
  })
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: AutocompleteResults,
  })
  @Auth('anonymous')
  public async autocomplete(
    @Body() params: AutocompleteParams
  ): Promise<AutocompleteResults> {
    const results = await this.geocoder.autocomplete(params);
    return { results };
  }
}
