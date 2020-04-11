import { Controller, HttpCode, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@utils/decorators';
import { GeocoderService } from '../geocoder.service';
import { AutocompleteResults, AutocompleteParams } from '../layer.model';

@ApiTags('geocoder')
@Controller('v1/geocoder/autocomplete')
export class AutocompleteController {
  constructor(private geocoder: GeocoderService) {}

  @Post()
  @ApiOperation({
    description: 'Autocomplete results',
  })
  @HttpCode(200)
  @Auth('anonymous')
  public async autocomplete(
    @Body() params: AutocompleteParams
  ): Promise<AutocompleteResults> {
    const results = await this.geocoder.autocomplete(params);
    return { results };
  }
}
