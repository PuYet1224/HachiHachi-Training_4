export interface PersonDTO {
    id: string;
    name: string;
    staffId: string;
  }
  
  export interface PositionDTO {
    id: number;
    name: string;
    people: PersonDTO[];
  }
  