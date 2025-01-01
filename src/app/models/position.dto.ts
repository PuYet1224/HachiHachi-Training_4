export interface PersonDTO {
    id: string;
    name: string;
  }
  
  export interface PositionDTO {
    id: number;
    name: string;
    people: PersonDTO[];
  }
  