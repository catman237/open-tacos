import React from "react";
import Card from './card';
import BarPercent from "./BarPercent";
import SingleStat from "./SingleStat";

/**
 * area_name - A string of the climbing areas name 
 * onPress - callback function for when the card is clicked
 * stats - {percent, colors} an object that contains the data for the BarPercent
 *   component
 */
function AreaCard({area_name, onPress, stats}) {
  const renderTotalClimbs = stats && stats.totalClimbs > 0;
  return (
    <Card
      onPress={onPress}
      footer={
        stats && 
        <BarPercent styles="-mt-2" percents={stats.percents} colors={stats.colors}></BarPercent>
      }
    >
      <div className="flex justify-between">
        <h2
          className="font-medium font-sans my-4 text-base truncate"
        >
          {area_name}
        </h2>
      {renderTotalClimbs && <SingleStat number={stats.totalClimbs} className="w-min"></SingleStat>}
      </div>
    </Card>
  );
}

export default AreaCard;