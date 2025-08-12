import type { Station, Train, TrainStop, TrainRoute, RouteResult, RouteSegment } from '../types/train';

class TrainService {
  private stations: Station[] = [];
  private trains: Train[] = [];

  constructor() {
    this.initializeStations();
  }

  private initializeStations() {
    // Major Indian railway stations
    this.stations = [
      { code: 'DEL', name: 'New Delhi' },
      { code: 'BOM', name: 'Mumbai Central' },
      { code: 'CCU', name: 'Kolkata' },
      { code: 'MAA', name: 'Chennai Central' },
      { code: 'BLR', name: 'Bangalore City' },
      { code: 'HYB', name: 'Hyderabad' },
      { code: 'AMD', name: 'Ahmedabad' },
      { code: 'PNE', name: 'Pune' },
      { code: 'SUR', name: 'Surat' },
      { code: 'KAN', name: 'Kanpur' },
      { code: 'NAG', name: 'Nagpur' },
      { code: 'IND', name: 'Indore' },
      { code: 'THN', name: 'Thanjavur' },
      { code: 'TRV', name: 'Thiruvananthapuram' },
      { code: 'COK', name: 'Kochi' },
      { code: 'VEL', name: 'Vellore' },
      { code: 'MYS', name: 'Mysuru' },
      { code: 'MNG', name: 'Mangalore' },
      { code: 'SHM', name: 'Shimoga' },
      { code: 'VJA', name: 'Vijayawada' },
      { code: 'VSK', name: 'Visakhapatnam' },
      { code: 'BHU', name: 'Bhubaneswar' },
      { code: 'AGR', name: 'Agra' },
      { code: 'JAI', name: 'Jaipur' },
      { code: 'JOD', name: 'Jodhpur' },
      { code: 'UDR', name: 'Udaipur' },
      { code: 'GUW', name: 'Guwahati' },
      { code: 'PAT', name: 'Patna' },
      { code: 'RNC', name: 'Ranchi' },
      { code: 'BHO', name: 'Bhopal' }
    ];
  }

  generateTestData() {
    this.trains = [];
    const trainNames = [
      'Rajdhani Express', 'Shatabdi Express', 'Duronto Express', 'Garib Rath',
      'Jan Shatabdi', 'Sampark Kranti', 'Humsafar Express', 'Tejas Express',
      'Vande Bharat', 'Double Decker', 'Intercity Express', 'Mail Express',
      'Passenger Train', 'Super Fast Express', 'Chennai Express', 'Mumbai Mail',
      'Karnataka Express', 'Tamil Nadu Express', 'Kerala Express', 'Gujarat Express'
    ];

    // Generate 1000+ trains with realistic routes
    for (let i = 1; i <= 1200; i++) {
      const trainName = trainNames[Math.floor(Math.random() * trainNames.length)];
      const trainId = `${String(i).padStart(5, '0')}`;
      
      // Create a route with 2-6 stations
      const routeLength = Math.floor(Math.random() * 5) + 2;
      const availableStations = [...this.stations];
      const selectedStations = [];
      
      // Pick random starting station
      const startIndex = Math.floor(Math.random() * availableStations.length);
      selectedStations.push(availableStations.splice(startIndex, 1)[0]);
      
      // Add more stations to the route
      for (let j = 1; j < routeLength; j++) {
        const nextIndex = Math.floor(Math.random() * availableStations.length);
        selectedStations.push(availableStations.splice(nextIndex, 1)[0]);
      }

      // Generate stops with realistic timings and distances
      const stops: TrainStop[] = [];
      let currentTime = this.generateRandomTime();
      
      for (let j = 0; j < selectedStations.length; j++) {
        const distance = j === 0 ? 0 : Math.floor(Math.random() * 300) + 50;
        
        stops.push({
          stationCode: selectedStations[j].code,
          distanceFromPrevious: distance,
          departureTime: currentTime
        });
        
        // Add travel time (1-4 hours between stations)
        const travelMinutes = Math.floor(Math.random() * 180) + 60;
        currentTime = this.addMinutesToTime(currentTime, travelMinutes);
      }

      this.trains.push({
        id: trainId,
        name: `${trainName} ${trainId}`,
        stops
      });
    }
  }

  private generateRandomTime(): string {
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  private addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = (hours * 60 + mins + minutes) % (24 * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  }

  getStations(): Station[] {
    return this.stations;
  }

  private getDirectRoutes(from: string, to: string): TrainRoute[] {
    const routes: TrainRoute[] = [];

    for (const train of this.trains) {
      let fromStopIndex = -1;
      let toStopIndex = -1;

      // Find source and destination in train route
      for (let i = 0; i < train.stops.length; i++) {
        if (train.stops[i].stationCode === from) {
          fromStopIndex = i;
        }
        if (train.stops[i].stationCode === to && fromStopIndex !== -1) {
          toStopIndex = i;
          break;
        }
      }

      if (fromStopIndex !== -1 && toStopIndex !== -1 && fromStopIndex < toStopIndex) {
        // Calculate total distance
        let totalDistance = 0;
        for (let i = fromStopIndex + 1; i <= toStopIndex; i++) {
          totalDistance += train.stops[i].distanceFromPrevious;
        }

        const route: TrainRoute = {
          trainId: train.id,
          trainName: train.name,
          fromStation: from,
          toStation: to,
          departureTime: train.stops[fromStopIndex].departureTime,
          arrivalTime: train.stops[toStopIndex].departureTime,
          distance: totalDistance,
          price: totalDistance * 1.25 // Rs 1.25 per km
        };

        routes.push(route);
      }
    }

    return routes;
  }

  private getConnectingRoutes(from: string, to: string): RouteResult[] {
    const connectingRoutes: RouteResult[] = [];

    // Find all intermediate stations that have connections
    const intermediateStations = new Set<string>();
    
    for (const train of this.trains) {
      let hasFrom = false;
      let hasTo = false;
      
      for (const stop of train.stops) {
        if (stop.stationCode === from) hasFrom = true;
        if (stop.stationCode === to) hasTo = true;
        
        if (hasFrom && !hasTo && stop.stationCode !== from) {
          intermediateStations.add(stop.stationCode);
        }
      }
    }

    // Try to find connecting routes through intermediate stations
    for (const intermediate of intermediateStations) {
      const firstLeg = this.getDirectRoutes(from, intermediate);
      const secondLeg = this.getDirectRoutes(intermediate, to);

      for (const first of firstLeg) {
        for (const second of secondLeg) {
          // Check if there's enough time for connection (at least 30 minutes)
          if (this.canConnect(first.arrivalTime, second.departureTime)) {
            const segments: RouteSegment[] = [
              {
                trainId: first.trainId,
                trainName: first.trainName,
                fromStation: first.fromStation,
                toStation: first.toStation,
                departureTime: first.departureTime,
                arrivalTime: first.arrivalTime,
                distance: first.distance,
                price: first.price
              },
              {
                trainId: second.trainId,
                trainName: second.trainName,
                fromStation: second.fromStation,
                toStation: second.toStation,
                departureTime: second.departureTime,
                arrivalTime: second.arrivalTime,
                distance: second.distance,
                price: second.price
              }
            ];

            connectingRoutes.push({
              segments,
              totalDistance: first.distance + second.distance,
              totalPrice: first.price + second.price,
              totalDuration: this.calculateTotalDuration(first.departureTime, second.arrivalTime)
            });
          }
        }
      }
    }

    return connectingRoutes;
  }

  private canConnect(arrivalTime: string, departureTime: string): boolean {
    const [arrHour, arrMin] = arrivalTime.split(':').map(Number);
    const [depHour, depMin] = departureTime.split(':').map(Number);
    
    let arrMinutes = arrHour * 60 + arrMin;
    let depMinutes = depHour * 60 + depMin;
    
    // Handle next day scenarios
    if (depMinutes < arrMinutes) {
      depMinutes += 24 * 60;
    }
    
    const timeDiff = depMinutes - arrMinutes;
    return timeDiff >= 30 && timeDiff <= 12 * 60; // 30 minutes to 12 hours connection time
  }

  private calculateTotalDuration(startTime: string, endTime: string): string {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return `${hours}h ${minutes}m`;
  }

  async findRoutes(from: string, to: string): Promise<RouteResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const routes: RouteResult[] = [];

    // Get direct routes
    const directRoutes = this.getDirectRoutes(from, to);
    for (const route of directRoutes) {
      routes.push({
        segments: [{
          trainId: route.trainId,
          trainName: route.trainName,
          fromStation: route.fromStation,
          toStation: route.toStation,
          departureTime: route.departureTime,
          arrivalTime: route.arrivalTime,
          distance: route.distance,
          price: route.price
        }],
        totalDistance: route.distance,
        totalPrice: route.price,
        totalDuration: this.calculateTotalDuration(route.departureTime, route.arrivalTime)
      });
    }

    // If no direct routes, try connecting routes
    if (routes.length === 0) {
      const connectingRoutes = this.getConnectingRoutes(from, to);
      routes.push(...connectingRoutes);
    }

    return routes.slice(0, 10); // Limit to top 10 results
  }
}

export const trainService = new TrainService();