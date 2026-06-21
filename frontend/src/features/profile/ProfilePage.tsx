import { useState } from 'react';
import { Button, Input, Avatar } from '../../components';
import { Mail, Phone, MapPin, Edit2 } from 'lucide-react';
import { getAuthUser } from '../../services/authApi';
import styles from './Profile.module.css';

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    const onboarding = JSON.parse(localStorage.getItem('arivium:onboardingProfile') || '{}');
    const auth = getAuthUser() || {};
    return {
      name: onboarding.name || auth.name || 'Student',
      role: onboarding.role || auth.role || localStorage.getItem('arivium:targetRole') || 'Target role not set',
      email: onboarding.email || auth.email || '',
      phone: onboarding.phone || '',
      location: onboarding.location || '',
      bio: onboarding.major ? `${onboarding.major} student preparing for ${onboarding.role}.` : 'Career profile generated from onboarding and resume analysis.',
      github: '',
      linkedin: ''
    };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Avatar fallback={profile.name[0]} size="lg" />
          <div className={styles.headerInfo}>
            <h1 className={styles.name}>{profile.name}</h1>
            <p className={styles.role}>{profile.role}</p>
          </div>
        </div>
        <Button 
          variant={isEditing ? 'primary' : 'outline'} 
          leftIcon={<Edit2 size={16} />}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </header>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Personal Information</h2>
        <div className={styles.grid}>
          <Input 
            label="Full Name" 
            value={profile.name} 
            onChange={e => setProfile({...profile, name: e.target.value})} 
            disabled={!isEditing} 
          />
          <Input 
            label="Role" 
            value={profile.role} 
            onChange={e => setProfile({...profile, role: e.target.value})} 
            disabled={!isEditing} 
          />
          <Input 
            label="Email" 
            value={profile.email} 
            onChange={e => setProfile({...profile, email: e.target.value})} 
            disabled={!isEditing} 
            leftIcon={<Mail size={16} />}
          />
          <Input 
            label="Phone" 
            value={profile.phone} 
            onChange={e => setProfile({...profile, phone: e.target.value})} 
            disabled={!isEditing} 
            leftIcon={<Phone size={16} />}
          />
          <Input 
            label="Location" 
            value={profile.location} 
            onChange={e => setProfile({...profile, location: e.target.value})} 
            disabled={!isEditing} 
            leftIcon={<MapPin size={16} />}
          />
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>About Me</h2>
        <textarea 
          className={styles.textarea}
          value={profile.bio}
          onChange={e => setProfile({...profile, bio: e.target.value})}
          disabled={!isEditing}
          rows={4}
        />
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Social Links</h2>
        <div className={styles.grid}>
          <Input 
            label="GitHub" 
            value={profile.github} 
            onChange={e => setProfile({...profile, github: e.target.value})} 
            disabled={!isEditing} 
          />
          <Input 
            label="LinkedIn" 
            value={profile.linkedin} 
            onChange={e => setProfile({...profile, linkedin: e.target.value})} 
            disabled={!isEditing} 
          />
        </div>
      </div>
    </div>
  );
}
