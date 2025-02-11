import { useState } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { PropertyType, mapDbPropertyToProperty } from "../types/property";
import { MobileNav } from "../components/MobileNav";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, Building2, MapPin, User, PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PropertySkeleton } from "@/components/skeletons/PropertySkeleton";

const propertyTypes: { value: PropertyType; label: string; icon: React.ReactNode }[] = [
  { value: "house_rent", label: "Houses for Rent", icon: <Home className="w-4 h-4" /> },
  { value: "house_sell", label: "Houses for Sale", icon: <Home className="w-4 h-4" /> },
  { value: "apartment_rent", label: "Apartments", icon: <Building2 className="w-4 h-4" /> },
  { value: "land_sell", label: "Land", icon: <MapPin className="w-4 h-4" /> },
];

const Index = () => {
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      return profile;
    },
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", selectedType],
    queryFn: async () => {
      console.log("Fetching properties with type:", selectedType);
      
      let query = supabase
        .from("properties")
        .select(`
          *,
          property_images (
            image_url
          )
        `);

      if (selectedType) {
        query = query.eq("type", selectedType);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching properties:", error);
        return [];
      }

      console.log("Fetched properties:", data);

      return data.map(mapDbPropertyToProperty);
    },
  });

  const handleUserIconClick = () => {
    if (!userProfile) {
      navigate("/login");
      return;
    }

    // Navigate based on user role
    switch (userProfile.role) {
      case "landlord":
        navigate("/landlord-dashboard");
        break;
      case "tenant":
        navigate("/tenant-dashboard");
        break;
      case "broker":
        navigate("/broker-dashboard");
        break;
      default:
        navigate("/complete-profile");
    }
  };

  const handleAddProperty = () => {
    navigate("/landlord-dashboard/properties");
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-maroon">Lovensunrise</h1>
          {isMobile ? (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleUserIconClick}
              >
                <User className="w-5 h-5" />
              </Button>
              {userProfile?.role === "landlord" && (
                <Button variant="ghost" size="icon" onClick={handleAddProperty}>
                  <PlusCircle className="w-5 h-5" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              {userProfile?.role === "landlord" && (
                <Button onClick={handleAddProperty}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              )}
              {!userProfile ? (
                <>
                  <Button variant="ghost" onClick={() => navigate("/login")}>
                    Log In
                  </Button>
                  <Button onClick={() => navigate("/signup")}>Sign Up</Button>
                </>
              ) : (
                <Button onClick={handleUserIconClick}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {propertyTypes.map((type) => (
            <button
              key={type.value}
              onClick={() =>
                setSelectedType(selectedType === type.value ? null : type.value)
              }
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedType === type.value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {type.icon}
              {type.label}
            </button>
          ))}
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-4`}>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <PropertySkeleton key={index} />
            ))
          ) : (
            properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
};

export default Index;
