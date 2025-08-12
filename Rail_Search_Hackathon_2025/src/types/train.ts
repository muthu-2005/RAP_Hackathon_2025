export interface Station {
  code: string;
  name: string;
}

export interface TrainStop {
  stationCode: string;
  distanceFromPrevious: number;
  departureTime: string;
}

export interface Train {
  id: string;
  name: string;
  stops: TrainStop[];
}

export interface TrainRoute {
  trainId: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  distance: number;
  price: number;
}

export interface RouteSegment {
  trainId: string;
  trainName: string;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  distance: number;
  price: number;
}

export interface RouteResult {
  segments: RouteSegment[];
  totalDistance: number;
  totalPrice: number;
  totalDuration: string;
}