import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Team } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [proponents, setProponents] = useState('');
  const [program, setProgram] = useState('');
  const [classCode, setClassCode] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adviser, setAdviser] = useState('');

  const fetchTeams = async () => {
    try {
      const data = await api.teams.list();
      setTeams(data);
    } catch (err) {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter(t => 
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    t.proponents.some(p => p.toLowerCase().includes(search.toLowerCase())) ||
    t.adviser.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.teams.create({
        team_name: name,
        proponents: proponents.split(',').map(p => p.trim()),
        program,
        class: classCode,
        email,
        contact_num: phone,
        adviser,
      });
      toast.success("Team added successfully!");
      setOpen(false);
      resetForm();
      fetchTeams();
    } catch (error) {
      toast.error("Failed to add team");
    }
  };

  const resetForm = () => {
    setName('');
    setProponents('');
    setProgram('');
    setClassCode('');
    setEmail('');
    setPhone('');
    setAdviser('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border shadow-sm gap-4">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight">Teams</h2>
          <p className="text-muted-foreground italic text-sm">Manage capstone teams and their profiles.</p>
        </div>
        <div className="flex items-center gap-3 w-full max-w-xl justify-end">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search teams, proponents..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Register New Team</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTeam} className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="tname">Team Name</Label>
                <Input id="tname" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="props">Proponents (Comma separated names)</Label>
                <Input id="props" placeholder="Student A, Student B, Student C" value={proponents} onChange={e => setProponents(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog">Program</Label>
                <Input id="prog" placeholder="e.g. BSIT" value={program} onChange={e => setProgram(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="class">Class Code</Label>
                <Input id="class" placeholder="e.g. IT-4A" value={classCode} onChange={e => setClassCode(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Team Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="adviser">Adviser</Label>
                <Input id="adviser" value={adviser} onChange={e => setAdviser(e.target.value)} required />
              </div>
              <DialogFooter className="col-span-2 mt-4">
                <Button type="submit">Create Team Profile</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Team Name</TableHead>
                <TableHead>Program/Class</TableHead>
                <TableHead>Adviser</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">Loading teams...</TableCell></TableRow>
              ) : filteredTeams.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No teams found.</TableCell></TableRow>
              ) : (
                filteredTeams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="font-semibold">{team.team_name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {team.proponents.join(', ')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">{team.program}</span>
                        <span className="text-xs text-muted-foreground">{team.class}</span>
                      </div>
                    </TableCell>
                    <TableCell>{team.adviser}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/teams/${team.id}`} className="flex items-center gap-1">
                          View Details <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
