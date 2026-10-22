"use client";

import React, { useState } from "react";
import { Control } from "react-hook-form";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapPin, Phone, Building, Search, Check, Pill, Clock, Star } from "lucide-react";

// UI Components

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Types
import { type TreatmentFormData, type PharmacyOption } from "@/lib/validations/treatment";

interface TreatmentPharmacySelectorProps {
  control: Control<TreatmentFormData>;
}

export const TreatmentPharmacySelector: React.FC<TreatmentPharmacySelectorProps> = ({ control }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPharmacy, setSelectedPharmacy] = useState<PharmacyOption | null>(null);

  // Fetch active pharmacies
  const pharmacies = useQuery(api.pharmacies.getActivePharmaciesForPrescription, {
    zipCode: undefined, // Could be enhanced with patient's zip code
    limit: 50,
  });

  // Filter pharmacies based on search term
  const filteredPharmacies = React.useMemo(() => {
    if (!pharmacies) return [];
    
    if (!searchTerm.trim()) return pharmacies;
    
    const term = searchTerm.toLowerCase();
    return pharmacies.filter(
      (pharmacy) =>
        pharmacy.name.toLowerCase().includes(term) ||
        pharmacy.chainName?.toLowerCase().includes(term) ||
        pharmacy.address.city.toLowerCase().includes(term) ||
        pharmacy.address.zipCode.includes(term)
    );
  }, [pharmacies, searchTerm]);

  // Format pharmacy address
  // const formatAddress = (address: PharmacyOption["address"]) => {
  //   return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
  // };

  // Handle pharmacy selection
  const handlePharmacySelect = (pharmacyId: string, onChange: (value: string) => void) => {
    const pharmacy = pharmacies?.find((p) => p._id === pharmacyId);
    setSelectedPharmacy(pharmacy as any || null);
    onChange(pharmacyId);
  };

  // Clear selection
  const clearSelection = (onChange: (value: string) => void) => {
    setSelectedPharmacy(null);
    onChange("");
  };

  // Get pharmacy icon based on chain name
  const getPharmacyIcon = (chainName?: string) => {
    if (!chainName) return <Building className="h-8 w-8 text-primary" />;

    const chain = chainName.toLowerCase();
    if (chain.includes('cvs')) return <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">CVS</div>;
    if (chain.includes('walgreens')) return <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">W</div>;
    if (chain.includes('rite aid')) return <div className="h-8 w-8 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm">RA</div>;
    if (chain.includes('walmart')) return <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">W</div>;
    if (chain.includes('target')) return <div className="h-8 w-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm">T</div>;

    return <Building className="h-8 w-8 text-primary" />;
  };

  // Get random rating for visual appeal (in real app, this would come from data)
  const getPharmacyRating = () => {
    const ratings = [4.2, 4.5, 4.7, 4.3, 4.6, 4.8, 4.1, 4.4];
    return ratings[Math.floor(Math.random() * ratings.length)];
  };

  // Get pharmacy features for visual appeal
  const getPharmacyFeatures = (chainName?: string) => {
    const baseFeatures = [
      { icon: <Pill className="h-3 w-3" />, text: "Rx Ready" },
      { icon: <Clock className="h-3 w-3" />, text: "Open 24/7" }
    ];

    if (chainName?.toLowerCase().includes('cvs')) {
      return [
        { icon: <Pill className="h-3 w-3" />, text: "ExtraCare" },
        { icon: <Clock className="h-3 w-3" />, text: "Drive-Thru" }
      ];
    }

    if (chainName?.toLowerCase().includes('walgreens')) {
      return [
        { icon: <Pill className="h-3 w-3" />, text: "myWalgreens" },
        { icon: <Clock className="h-3 w-3" />, text: "24 Hour" }
      ];
    }

    return baseFeatures;
  };

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4 pb-3 border-b">
        <h2 className="font-medium">Pharmacy Selection (Optional)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a pharmacy for prescription delivery. This is optional and can be set later.
        </p>
      </div>
      <div className="p-4 space-y-4">
        <FormField
          control={control}
          name="pharmacyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Pharmacy</FormLabel>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pharmacies by name, chain, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selected Pharmacy Display */}
              {selectedPharmacy && (
                <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getPharmacyIcon(selectedPharmacy.chainName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">{selectedPharmacy.name}</h4>
                            <Badge variant="default" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Selected
                            </Badge>
                          </div>
                          {selectedPharmacy.chainName && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedPharmacy.chainName}
                            </Badge>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{selectedPharmacy.address.city}, {selectedPharmacy.address.state}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{selectedPharmacy.phone}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => clearSelection(field.onChange)}
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pharmacy Grid */}
              {!selectedPharmacy && (
                <div className="space-y-4">
                  {!pharmacies ? (
                    // Loading state
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : filteredPharmacies.length === 0 ? (
                    // No results
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Building className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">No pharmacies found</h3>
                      <p className="text-muted-foreground text-sm">
                        {searchTerm ? "Try adjusting your search terms." : "No pharmacies are currently available."}
                      </p>
                    </div>
                  ) : (
                    // Pharmacy grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {filteredPharmacies.map((pharmacy) => {
                        const rating = getPharmacyRating();
                        const features = getPharmacyFeatures(pharmacy.chainName);
                        return (
                          <button
                            key={pharmacy._id}
                            type="button"
                            onClick={() => handlePharmacySelect(pharmacy._id, field.onChange)}
                            className="group border border-border rounded-lg p-4 text-left hover:border-primary hover:shadow-md transition-all duration-200 bg-card hover:bg-accent/50"
                          >
                            <div className="space-y-3">
                              {/* Pharmacy Header */}
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {getPharmacyIcon(pharmacy.chainName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {pharmacy.name}
                                  </h4>
                                  {pharmacy.chainName && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      {pharmacy.chainName}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              {/* Pharmacy Details */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">{pharmacy.address.city}, {pharmacy.address.state}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{rating}</span>
                                  </div>
                                  {(pharmacy as any).isVerified && (
                                    <Badge variant="outline" className="text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>

                                {/* Pharmacy Features */}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                      {feature.icon}
                                      <span>{feature.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Skip Option */}
              {!selectedPharmacy && (
                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => field.onChange("")}
                    className="text-muted-foreground"
                  >
                    Skip pharmacy selection for now
                  </Button>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
