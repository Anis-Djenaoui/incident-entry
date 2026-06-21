'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NativeDateInput } from '@/components/ui/native-date-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCreateDossier } from '@/hooks/use-create-dossier';
import { useToast } from '@/hooks/use-toast';
import { getDocumentDownloadUrl } from '@/lib/api/dossier.api';
import { cardSwap, fadeInUp, fieldItem, scaleTap, staggerContainer } from '@/lib/motion';
import {
  COMPAGNIE_OPTIONS,
  dossierFormSchema,
  formValuesToPayload,
  type DossierFormValues,
} from '@/lib/schemas/dossier.schema';

const defaultValues: Partial<DossierFormValues> = {
  numeroDossier: '',
  compagnie: undefined,
  dateSurvenance: '',
  immatriculation: '',
  nomAssure: '',
  nomConducteur: '',
  copierNomAssure: false,
  nomTier: '',
  numeroCarteOrange: '',
  dateEffet: '',
  dateEcheance: '',
  natureIncident: undefined,
};

export function DossierForm() {
  const { toast } = useToast();
  const createDossier = useCreateDossier();
  const reduceMotion = useReducedMotion();
  const [createdDossier, setCreatedDossier] = useState<{
    id: string;
    documentUrl: string;
  } | null>(null);

  const form = useForm<DossierFormValues>({
    resolver: zodResolver(dossierFormSchema),
    defaultValues,
  });

  const copierNomAssure = form.watch('copierNomAssure');
  const nomAssure = form.watch('nomAssure');

  useEffect(() => {
    if (copierNomAssure) {
      form.setValue('nomConducteur', nomAssure, { shouldValidate: true });
    }
  }, [copierNomAssure, nomAssure, form]);

  const onSubmit = async (values: DossierFormValues) => {
    try {
      const result = await createDossier.mutateAsync(formValuesToPayload(values));
      setCreatedDossier({ id: result.id, documentUrl: result.documentUrl });
      toast({
        title: 'Succès',
        description: result.message,
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du dossier.',
      });
    }
  };

  const handleNewDossier = () => {
    setCreatedDossier(null);
    form.reset(defaultValues);
  };

  const container = reduceMotion ? undefined : staggerContainer;
  const item = reduceMotion ? undefined : fieldItem;

  return (
    <AnimatePresence mode="wait">
      {createdDossier ? (
        <motion.div
          key="success"
          variants={reduceMotion ? undefined : cardSwap}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-2xl"
        >
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-brand-gradient" />
            <CardHeader className="items-center pb-2 text-center">
              <SuccessCheck reduceMotion={!!reduceMotion} />
              <CardTitle className="mt-4">Dossier créé</CardTitle>
              <CardDescription>
                Le dossier a été enregistré et le document a été généré.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              <div className="rounded-[calc(var(--radius)-0.2rem)] border border-border/70 bg-muted/40 p-4">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Identifiant du dossier
                </p>
                <p className="break-all font-mono text-sm text-foreground">{createdDossier.id}</p>
              </div>
              <motion.div {...(reduceMotion ? {} : scaleTap)}>
                <Button asChild size="lg" className="w-full">
                  <a
                    href={getDocumentDownloadUrl(createdDossier.documentUrl)}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le document
                  </a>
                </Button>
              </motion.div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={handleNewDossier} className="w-full">
                Créer un nouveau dossier
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          variants={reduceMotion ? undefined : fadeInUp}
          initial="hidden"
          animate="visible"
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          className="w-full max-w-4xl"
        >
          <Card className="overflow-hidden">
            <div className="h-1.5 w-full bg-brand-gradient" />
            <CardHeader className="gap-3 border-b border-border/60 bg-secondary/30 sm:flex-row sm:items-center">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <CardTitle>Saisie de dossier sinistre</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous pour créer un nouveau dossier.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2"
                  >
                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="numeroDossier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de dossier</FormLabel>
                            <FormControl>
                              <Input placeholder="DOS-2025-001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="compagnie"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Compagnie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la compagnie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {COMPAGNIE_OPTIONS.map((compagnie) => (
                                  <SelectItem key={compagnie} value={compagnie}>
                                    {compagnie}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="dateSurvenance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de survenance</FormLabel>
                            <FormControl>
                              <NativeDateInput {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="immatriculation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Immatriculation</FormLabel>
                            <FormControl>
                              <Input placeholder="AB-123-CD" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="nomAssure"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom de l&apos;assuré</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom de l'assuré" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="copierNomAssure"
                        render={({ field }) => (
                          <FormItem className="flex h-11 flex-row items-center justify-between mt-8 gap-3 rounded-[calc(var(--radius)-0.2rem)] border border-border/70 bg-secondary/30 px-3.5 transition-colors hover:bg-secondary/50">
                            <FormLabel className="cursor-pointer">
                              Copier le nom de l&apos;assuré
                            </FormLabel>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nomConducteur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du conducteur</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom du conducteur"
                                readOnly={copierNomAssure}
                                className={copierNomAssure ? 'bg-muted' : ''}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="nomTier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du tiers</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du tiers" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="numeroCarteOrange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro carte orange</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="dateEffet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d&apos;effet</FormLabel>
                            <FormControl>
                              <NativeDateInput {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="dateEcheance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date d&apos;échéance</FormLabel>
                            <FormControl>
                              <NativeDateInput {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="natureIncident"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nature de l&apos;incident</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner la nature" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="corporel">Corporel</SelectItem>
                                <SelectItem value="materiel">Matériel</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div variants={item}>
                      <FormField
                        control={form.control}
                        name="provision"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Provision (TND)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value === '' ? undefined : parseFloat(value));
                                }}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </motion.div>

                  <motion.div {...(reduceMotion ? {} : scaleTap)}>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={createDossier.isPending}
                    >
                      {createDossier.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création en cours...
                        </>
                      ) : (
                        'Créer le dossier'
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessCheck({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      className="flex h-16 w-16 items-center justify-center rounded-full bg-accent ring-8 ring-accent/30"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-8 w-8 text-primary"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: reduceMotion ? 0 : 0.15 }}
        />
      </svg>
    </motion.div>
  );
}
