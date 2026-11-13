import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { requestService } from '../../services/request.service';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { LocationPickerMap } from '../../components/location/LocationPickerMap';
import { ALL_BLOOD_GROUPS, BloodGroup } from '../../lib/bloodCompatibility';
import { UrgencyLevel } from '../../types/request.types';
import {
  Building2,
  Navigation,
  Radio,
  User,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';

const createRequestSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, 'Patient name must be at least 2 characters')
    .max(100, 'Patient name cannot exceed 100 characters'),
  bloodGroup: z.enum(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as [
    BloodGroup,
    ...BloodGroup[]
  ]),
  unitsNeeded: z.coerce
    .number()
    .int('Must be a whole number')
    .min(1, 'At least 1 unit is required')
    .max(10, 'Cannot exceed 10 units per request'),
  urgencyLevel: z.enum(['CRITICAL', 'URGENT', 'SCHEDULED'] as [
    UrgencyLevel,
    ...UrgencyLevel[]
  ]),
  hospitalName: z
    .string()
    .trim()
    .min(2, 'Hospital name must be at least 2 characters')
    .max(150, 'Hospital name cannot exceed 150 characters'),
  hospitalAddress: z
    .string()
    .trim()
    .min(3, 'Hospital address must be at least 3 characters')
    .max(250, 'Hospital address cannot exceed 250 characters'),
  hospitalLat: z.coerce
    .number({ invalid_type_error: 'Hospital latitude is required' })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  hospitalLng: z.coerce
    .number({ invalid_type_error: 'Hospital longitude is required' })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  expiresInHours: z.coerce
    .number()
    .min(1, 'Minimum expiry is 1 hour')
    .max(72, 'Maximum expiry is 72 hours')
    .default(12),
});

type CreateRequestFormData = z.infer<typeof createRequestSchema>;

export const CreateRequestPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      patientName: '',
      bloodGroup: 'B+',
      unitsNeeded: 1,
      urgencyLevel: 'CRITICAL',
      hospitalName: '',
      hospitalAddress: '',
      expiresInHours: 12,
    },
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser', 'Location');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('hospitalLat', parseFloat(pos.coords.latitude.toFixed(6)), {
          shouldValidate: true,
        });
        setValue('hospitalLng', parseFloat(pos.coords.longitude.toFixed(6)), {
          shouldValidate: true,
        });
        setIsLocating(false);
        toast.info('Hospital coordinates populated from GPS', 'GPS Located');
      },
      (err) => {
        setIsLocating(false);
        toast.error('Could not obtain GPS location: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const onSubmit = async (data: CreateRequestFormData) => {
    try {
      setIsSubmitting(true);
      const res = await requestService.createRequest({
        patientName: data.patientName,
        bloodGroup: data.bloodGroup,
        unitsNeeded: Number(data.unitsNeeded),
        urgencyLevel: data.urgencyLevel,
        hospitalName: data.hospitalName,
        hospitalAddress: data.hospitalAddress,
        hospitalLat: Number(data.hospitalLat),
        hospitalLng: Number(data.hospitalLng),
        expiresInHours: Number(data.expiresInHours),
      });

      toast.success(
        res.message || 'Emergency request broadcast successfully!',
        'Emergency Broadcast Sent'
      );
      navigate(`/requests/${res.request._id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <PageHeader
        title="Broadcast Emergency Blood Need"
        subtitle="Immediately alert and pool compatible donors nearby with verified hospital coordinates."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Requests', href: '/requests' },
          { label: 'Broadcast Need' },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: Patient & Requirement Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-blood-700" />
              <span>Patient & Blood Requirement</span>
            </CardTitle>
            <CardDescription>
              Specify recipient medical details to calculate compatibility matrix.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Patient Full Name"
                placeholder="e.g. Rahul Verma"
                error={errors.patientName?.message}
                required
                {...register('patientName')}
              />

              <Select
                label="Required Blood Group"
                error={errors.bloodGroup?.message}
                required
                {...register('bloodGroup')}
              >
                {ALL_BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Units Needed (1 - 10)"
                type="number"
                min={1}
                max={10}
                error={errors.unitsNeeded?.message}
                required
                {...register('unitsNeeded')}
              />

              <Select
                label="Urgency Level"
                error={errors.urgencyLevel?.message}
                required
                {...register('urgencyLevel')}
              >
                <option value="CRITICAL">CRITICAL (Immediate)</option>
                <option value="URGENT">URGENT (&lt; 6 Hours)</option>
                <option value="SCHEDULED">SCHEDULED (Elective / Planned)</option>
              </Select>

              <Input
                label="Broadcast Lifetime (Hours)"
                type="number"
                min={1}
                max={72}
                error={errors.expiresInHours?.message}
                helperText="Auto-expires if unfilled"
                required
                {...register('expiresInHours')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Hospital & Location Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blood-700" />
                  <span>Hospital Details & Road Telemetry</span>
                </CardTitle>
                <CardDescription>
                  Coordinates are used by OSRM to calculate precise driving distance and ETA for responders.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hospital / Clinic Name"
                placeholder="e.g. Apollo Emergency Hospital"
                error={errors.hospitalName?.message}
                required
                {...register('hospitalName')}
              />

              <Input
                label="Hospital Address / Area"
                placeholder="e.g. 154 Bannerghatta Main Rd, Bangalore"
                error={errors.hospitalAddress?.message}
                required
                {...register('hospitalAddress')}
              />
            </div>

            {/* Interactive Location Picker Map */}
            <LocationPickerMap
              lat={watch('hospitalLat') ? Number(watch('hospitalLat')) : null}
              lng={watch('hospitalLng') ? Number(watch('hospitalLng')) : null}
              onChange={(lat, lng) => {
                setValue('hospitalLat', lat, { shouldValidate: true });
                setValue('hospitalLng', lng, { shouldValidate: true });
              }}
              markerType="hospital"
              height="260px"
              helperText="Click anywhere on the map or click 'Detect My GPS' to set exact hospital pin."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hospital Latitude"
                type="number"
                step="any"
                placeholder="Click map or enter latitude"
                error={errors.hospitalLat?.message}
                required
                {...register('hospitalLat')}
              />

              <Input
                label="Hospital Longitude"
                type="number"
                step="any"
                placeholder="Click map or enter longitude"
                error={errors.hospitalLng?.message}
                required
                {...register('hospitalLng')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/requests')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            leftIcon={<Radio className="w-5 h-5 text-white animate-pulse" />}
            className="px-8 shadow-md shadow-blood-700/25 font-bold"
          >
            Trigger Emergency Broadcast
          </Button>
        </div>
      </form>
    </div>
  );
};
