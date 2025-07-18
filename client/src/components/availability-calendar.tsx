import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, X } from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  type: "available" | "busy" | "preferred";
}

interface AvailabilityCalendarProps {
  timeSlots: TimeSlot[];
  onSlotsChange?: (slots: TimeSlot[]) => void;
  isEditable?: boolean;
  timezone?: string;
}

export default function AvailabilityCalendar({ 
  timeSlots, 
  onSlotsChange, 
  isEditable = false,
  timezone = "UTC"
}: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<TimeSlot[]>(timeSlots);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return [`${hour}:00`, `${hour}:30`];
  }).flat();

  const getSlotColor = (type: string) => {
    switch (type) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "busy":
        return "bg-red-100 text-red-800 border-red-200";
      case "preferred":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const addTimeSlot = (day: string, startTime: string, endTime: string, type: "available" | "busy" | "preferred") => {
    const newSlot: TimeSlot = {
      id: `${day}-${startTime}-${endTime}-${Date.now()}`,
      day,
      startTime,
      endTime,
      type
    };
    
    const updatedSlots = [...slots, newSlot];
    setSlots(updatedSlots);
    onSlotsChange?.(updatedSlots);
  };

  const removeTimeSlot = (id: string) => {
    const updatedSlots = slots.filter(slot => slot.id !== id);
    setSlots(updatedSlots);
    onSlotsChange?.(updatedSlots);
  };

  const getSlotsForDay = (day: string) => {
    return slots.filter(slot => slot.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getAvailabilityStatus = () => {
    const availableSlots = slots.filter(s => s.type === "available").length;
    const totalSlots = slots.length;
    
    if (totalSlots === 0) return { status: "Not set", color: "text-gray-500" };
    if (availableSlots === 0) return { status: "Busy", color: "text-red-600" };
    if (availableSlots >= totalSlots * 0.7) return { status: "Very Available", color: "text-green-600" };
    if (availableSlots >= totalSlots * 0.4) return { status: "Moderately Available", color: "text-yellow-600" };
    
    return { status: "Limited Availability", color: "text-orange-600" };
  };

  const { status, color } = getAvailabilityStatus();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Availability Calendar
          <Badge variant="outline" className={`ml-auto ${color}`}>
            {status}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          Timezone: {timezone}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Weekly Overview */}
          <div className="grid grid-cols-1 gap-3">
            {daysOfWeek.map(day => {
              const daySlots = getSlotsForDay(day);
              
              return (
                <div key={day} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{day}</h4>
                    {isEditable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // In a real implementation, this would open a time picker
                          addTimeSlot(day, "09:00", "17:00", "available");
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  {daySlots.length === 0 ? (
                    <p className="text-xs text-gray-400">No availability set</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {daySlots.map(slot => (
                        <div
                          key={slot.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getSlotColor(slot.type)}`}
                        >
                          <span>{slot.startTime} - {slot.endTime}</span>
                          {isEditable && (
                            <button
                              onClick={() => removeTimeSlot(slot.id)}
                              className="ml-1 hover:bg-white/50 rounded"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Actions for Editing */}
          {isEditable && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm">Quick Setup</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add weekday business hours
                    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                    weekdays.forEach(day => {
                      addTimeSlot(day, "09:00", "17:00", "available");
                    });
                  }}
                  className="text-xs"
                >
                  Weekdays 9-5
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add evening availability
                    daysOfWeek.forEach(day => {
                      addTimeSlot(day, "18:00", "22:00", "available");
                    });
                  }}
                  className="text-xs"
                >
                  Evenings 6-10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add weekend availability
                    ["Saturday", "Sunday"].forEach(day => {
                      addTimeSlot(day, "10:00", "16:00", "available");
                    });
                  }}
                  className="text-xs"
                >
                  Weekend Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Clear all slots
                    setSlots([]);
                    onSlotsChange?.([]);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}

          {/* Availability Legend */}
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t text-xs">
            <span className="text-gray-600">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Preferred</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Busy</span>
            </div>
          </div>

          {/* Collaboration Tips */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> Clear availability increases match potential! 
              Developers with defined schedules get 60% more collaboration requests.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}