import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ExternalLink, Github, Play, ImageIcon } from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  videoUrl?: string;
  category: "web" | "mobile" | "desktop" | "game" | "ai" | "other";
}

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
  isEditable?: boolean;
  onItemClick?: (item: PortfolioItem) => void;
}

export default function PortfolioShowcase({ 
  items, 
  isEditable = false, 
  onItemClick 
}: PortfolioShowcaseProps) {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    setCurrentImageIndex(0);
    onItemClick?.(item);
  };

  const nextImage = () => {
    if (selectedItem && selectedItem.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === selectedItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedItem && selectedItem.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedItem.images.length - 1 : prev - 1
      );
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      web: "bg-blue-100 text-blue-800",
      mobile: "bg-green-100 text-green-800",
      desktop: "bg-purple-100 text-purple-800",
      game: "bg-red-100 text-red-800",
      ai: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  if (!items?.length) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Portfolio Showcase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No portfolio items yet</p>
            {isEditable && (
              <Button variant="outline" className="mt-3">
                Add Your First Project
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Portfolio Showcase
            <Badge variant="secondary" className="ml-auto">
              {items.length} {items.length === 1 ? 'Project' : 'Projects'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {/* Project Image */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <Badge 
                    className={`absolute top-2 left-2 ${getCategoryColor(item.category)}`}
                  >
                    {item.category}
                  </Badge>

                  {/* Image Count Indicator */}
                  {item.images.length > 1 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-black/70 text-white"
                    >
                      {item.images.length} photos
                    </Badge>
                  )}
                </div>

                {/* Project Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <div className="flex gap-1">
                      {item.liveUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.liveUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      {item.githubUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.githubUrl, '_blank');
                          }}
                        >
                          <Github className="w-4 h-4" />
                        </Button>
                      )}
                      {item.videoUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.videoUrl, '_blank');
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1">
                    {item.technologies.slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {item.technologies.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.technologies.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.title}
                  <Badge className={getCategoryColor(selectedItem.category)}>
                    {selectedItem.category}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image Carousel */}
                {selectedItem.images.length > 0 && (
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedItem.images[currentImageIndex]}
                        alt={`${selectedItem.title} - Image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {selectedItem.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90"
                          onClick={nextImage}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {selectedItem.images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Project Description */}
                <div>
                  <h4 className="font-semibold mb-2">About This Project</h4>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>

                {/* Technologies */}
                <div>
                  <h4 className="font-semibold mb-2">Technologies Used</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.technologies.map((tech) => (
                      <Badge key={tech} variant="outline">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {selectedItem.liveUrl && (
                    <Button 
                      className="flex-1" 
                      onClick={() => window.open(selectedItem.liveUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Live
                    </Button>
                  )}
                  {selectedItem.githubUrl && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(selectedItem.githubUrl, '_blank')}
                    >
                      <Github className="w-4 h-4 mr-2" />
                      View Code
                    </Button>
                  )}
                  {selectedItem.videoUrl && (
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(selectedItem.videoUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Demo Video
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}