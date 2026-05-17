import { User } from '../types';

export interface CompletenessResult {
    score: number;       // 0–100
    missing: string[];   // labels of missing items
    total: number;
    done: number;
}

export function getProfileCompleteness(user: User): CompletenessResult {
    const checks: { label: string; done: boolean }[] = [
        { label: 'Profile photo', done: !!user.photoUrl },
        { label: 'First & last name', done: !!(user.firstName && user.lastName) },
        { label: 'Email address', done: !!user.email },
        { label: 'Phone number', done: !!user.phoneNumber },
        { label: 'Home address', done: !!user.address },
        { label: 'State / location', done: !!user.state },
    ];
    const done = checks.filter((c) => c.done).length;
    const missing = checks.filter((c) => !c.done).map((c) => c.label);
    return {
        score: Math.round((done / checks.length) * 100),
        missing,
        total: checks.length,
        done,
    };
}
