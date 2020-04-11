import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum GeocoderLayer {
  Venue = 'venue',
  Address = 'address',
  Street = 'street',
  Country = 'country',
  MacroRegion = 'macroregion',
  MacroCounty = 'macrocounty',
  Locality = 'locality',
  LocalAdmin = 'localadmin',
  Borough = 'borough',
  Neighbourhood = 'neighbourhood',
  Coarse = 'coarse',
  PostalCode = 'postalcode',
}

export class AutocompleteResult {
  public label: string;
  public latitude: number;
  public longitude: number;
}

export class AutocompleteResults {
  public results: AutocompleteResult[];
}

export class AutocompleteParams {
  @IsString()
  public text: string;

  @IsNumber()
  @IsOptional()
  public size?: number = 10;

  @IsNumber()
  @IsOptional()
  public focusLatitude?: number;

  @IsNumber()
  @IsOptional()
  public focusLongitude?: number;

  @IsEnum(GeocoderLayer)
  @IsOptional()
  @ApiPropertyOptional({
    description:
      'See https://github.com/pelias/documentation/blob/master/autocomplete.md#layers',
  })
  public layer?: GeocoderLayer;
}
