import React from "react";
import Card from './card';
import RouteTypeChips from "./RouteTypeChips";
import RouteGradeChip from "./RouteGradeChip";

function RouteCard({route_name, type, safety, YDS, onPress}) {
  return (
    <Card
      onPress={onPress}
    >
      <h2
        className="font-medium font-sans my-4 text-base truncate"
      >
        {route_name}
      </h2>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <RouteGradeChip yds={YDS} safety={safety}></RouteGradeChip>
          <RouteTypeChips type={type}></RouteTypeChips>
        </div>
      </div>
    </Card>
  );
}

export default RouteCard;