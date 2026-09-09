'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileInput } from '@/lib/validation/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SecretField } from '@/components/admin/SecretField';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  });

  const legalNameValue = watch('legalName');
  const privateNotesValue = watch('privateNotes');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/configuration/profile');
        const result = await res.json();
        if (result.ok && result.data) {
          const p = result.data;
          setValue('fullName', p.fullName);
          setValue('headline', p.headline);
          setValue('tagline', p.tagline);
          setValue('bio', p.bio);
          setValue('avatarUrl', p.avatarUrl);
          setValue('location', p.location);
          setValue('availability', p.availability);
          setValue('resumeUrl', p.resumeUrl);
          setValue('funFacts', p.funFacts);
          setValue('legalName', p.legalName);
          setValue('privateNotes', p.privateNotes);
        }
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [setValue]);

  const onSubmit = async (data: ProfileInput) => {
    try {
      const res = await fetch('/api/configuration/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error?.message || 'Update failed');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-500">Manage your public portfolio identity and private notes.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Full Name</label>
            <Input {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Headline</label>
            <Input {...register('headline')} />
            {errors.headline && <p className="text-xs text-red-500">{errors.headline.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Tagline</label>
          <Input {...register('tagline')} />
          {errors.tagline && <p className="text-xs text-red-500">{errors.tagline.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Bio (Markdown)</label>
          <textarea
            {...register('bio')}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-transparent min-h-[150px]"
          />
          {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Location</label>
            <Input {...register('location')} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Availability</label>
            <Input {...register('availability')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Avatar URL</label>
            <Input {...register('avatarUrl')} />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Résumé URL</label>
            <Input {...register('resumeUrl')} />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-6">
          <h2 className="text-lg font-semibold">Private Information</h2>
          <SecretField
            label="Legal Name"
            value={legalNameValue}
            onChange={(val) => setValue('legalName', val)}
          />
          <SecretField
            label="Private Notes"
            value={privateNotesValue}
            onChange={(val) => setValue('privateNotes', val)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="px-8">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
