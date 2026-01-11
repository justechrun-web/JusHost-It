'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, DollarSign, Users, TrendingUp, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { getReferralStats, getReferralLeaderboard, getAccountCredits } from '@/lib/referral/actions';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReferralDashboard() {
  const [referralStats, setReferralStats] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    async function loadReferralData() {
        if (!user) return;
        setLoading(true);
        try {
            const [stats, creditsData, leaderboardData] = await Promise.all([
                getReferralStats(),
                getAccountCredits(),
                getReferralLeaderboard(),
            ]);
            setReferralStats(stats);
            setCredits(creditsData);
            setLeaderboard(leaderboardData);
        } catch (error) {
            console.error("Failed to load referral data", error);
        } finally {
            setLoading(false);
        }
    }
    loadReferralData();
  }, [user]);

  const copyReferralLink = () => {
    if (referralStats) {
      navigator.clipboard.writeText(referralStats.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnSocial = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!referralStats) return;

    const message = encodeURIComponent(
      `I'm using JusHostIt for my hosting and love it! Get $10 in credits when you sign up with my link:`
    );
    const url = encodeURIComponent(referralStats.referralUrl);

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${message}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      email: `mailto:?subject=Get $10 in JusHostIt Credits&body=${message} ${referralStats.referralUrl}`,
    };

    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  const formatDate = (timestamp: number) => {
    const days = Math.floor((timestamp - Date.now()) / (24 * 60 * 60 * 1000));
    if (days < 0) return 'Expired';
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold font-headline tracking-tight">Referral Program</h1>
            <p className="text-muted-foreground">Share JusHostIt with friends and earn $10 for each referral.</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium">Total Earnings</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">${referralStats?.totalEarnings || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">All-time rewards</div>
          </div>

           <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium">Successful Referrals</span>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{referralStats?.totalReferrals || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Converted to paid</div>
          </div>

           <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium">Pending Referrals</span>
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">{referralStats?.pendingReferrals || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Awaiting conversion</div>
          </div>
          
           <div className="bg-card rounded-xl shadow-lg p-6 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm font-medium">Available Credits</span>
              <Gift className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold">${credits?.totalCredits || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Ready to use</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl shadow-lg p-8 text-primary-foreground">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3">Give $10, Get $10</h2>
            <p className="text-primary-foreground/80 mb-6">
              Share your unique referral link. When someone signs up and subscribes, you both get $10 in credits!
            </p>

            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-black/20 rounded-lg px-4 py-3 text-left">
                  <code className="font-mono text-sm break-all">
                    {referralStats?.referralUrl || 'Loading...'}
                  </code>
                </div>
                <Button
                  onClick={copyReferralLink}
                  variant="secondary"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-primary-foreground/80 mb-2">Or share your referral code:</p>
              <div className="inline-block bg-black/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <code className="text-2xl font-bold tracking-wider">{referralStats?.code || '...'}</code>
              </div>
            </div>

            <div className="flex justify-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => shareOnSocial('twitter')} title="Share on Twitter">
                    <Twitter className="w-5 h-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => shareOnSocial('facebook')} title="Share on Facebook">
                    <Facebook className="w-5 h-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => shareOnSocial('linkedin')} title="Share on LinkedIn">
                    <Linkedin className="w-5 h-5" />
                </Button>
                 <Button variant="ghost" size="icon" onClick={() => shareOnSocial('email')} title="Share via Email">
                    <Mail className="w-5 h-5" />
                </Button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl shadow-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-primary" />
                Your Credits
                </h2>
                
                <div className="space-y-3 mb-6">
                {credits?.credits.map((credit:any) => (
                    <div key={credit.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div>
                        <div className="font-semibold">${credit.amount} Credit</div>
                        <div className="text-sm text-muted-foreground capitalize">
                        {credit.type.replace('_', ' ')}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Expires in</div>
                        <div className="text-sm font-medium">
                        {formatDate(credit.expiresAt)}
                        </div>
                    </div>
                    </div>
                ))}
                {(!credits || credits.credits.length === 0) && (
                    <p className="text-center text-sm text-muted-foreground py-8">You have no active credits.</p>
                )}
                </div>
            </div>

            <div className="bg-card rounded-xl shadow-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Top Referrers
                </h2>
                
                <div className="space-y-2">
                {leaderboard.map((user, index) => (
                    <div
                    key={index}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                        user.isCurrentUser ? 'bg-primary/10 border-2 border-primary/50' : 'bg-muted/50'
                    }`}
                    >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-slate-300 text-slate-700' :
                        index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-muted'
                    }`}>
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <div className="font-semibold">
                        {user.displayName}
                        {user.isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            You
                            </span>
                        )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                        {user.totalReferrals} referrals • ${user.totalRewards} earned
                        </div>
                    </div>
                    {index < 3 && (
                        <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                    )}
                    </div>
                ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
